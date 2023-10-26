import pandas as pd 
import math
from sklearn.metrics.pairwise import cosine_similarity
import geopandas as gpd
from shapely.geometry import Point
from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app


data = pd.read_csv('data.csv' )

restaurant_data = pd.read_csv('restaurant_data.csv' )
restaurant_data.drop(columns='Unnamed: 0', inplace=True)

features = pd.read_csv('features.csv')
features.set_index('title', inplace=True)

gdf = gpd.GeoDataFrame(data, 
                      geometry=gpd.points_from_xy(data.longitude, data.latitude))


cosine_sim = cosine_similarity(features, features)

indices = pd.Series(restaurant_data.index, index=restaurant_data['title']).drop_duplicates()

def haversine(lat1, lon1, lat2, lon2):
     
    # distance between latitudes
    # and longitudes
    dLat = (lat2 - lat1) * math.pi / 180.0
    dLon = (lon2 - lon1) * math.pi / 180.0
 
    # convert to radians
    lat1 = (lat1) * math.pi / 180.0
    lat2 = (lat2) * math.pi / 180.0
 
    # apply formulae
    a = (pow(math.sin(dLat / 2), 2) +
         pow(math.sin(dLon / 2), 2) *
             math.cos(lat1) * math.cos(lat2));
    rad = 6371
    c = 2 * math.asin(math.sqrt(a))
    c = round((c*rad),1)
    return c


def get_latitude_longitude(restaurant_name):
    try:
        # Find the row where the restaurant name matches
        row = restaurant_data.loc[restaurant_data['title'] == restaurant_name]
        
        # Extract latitude and longitude from the row
        latitude = row['latitude'].values[0]
        longitude = row['longitude'].values[0]
        
        return latitude, longitude
    except IndexError:
        # Handle the case where the restaurant name is not found in the DataFrame
        print(f"Restaurant '{restaurant_name}' not found in the dataset.")
        return None, None


def get_recommendations_with_latlon_and_info(restaurant_name, cosine_sim= cosine_sim):
    # Get the index of the restaurant that matches the input name
    idx = indices[restaurant_name]

    # Get the pairwise similarity scores of all restaurants with that restaurant
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort the restaurants based on the similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Get the top 10 most similar restaurants (excluding itself)
    sim_scores = sim_scores[1:10]

    # Get the restaurant indices
    restaurant_indices = [i[0] for i in sim_scores]

    # Get the top 10 most similar restaurants' data
    similar_restaurants = restaurant_data.iloc[restaurant_indices]
    

    # Fetch additional information (thumbnail, link, and order_online) from the 'data' DataFrame
    additional_info = data[data['title'].isin(similar_restaurants['title'])]

    # Merge the additional information into the 'similar_restaurants' DataFrame
    similar_restaurants = pd.merge(similar_restaurants, additional_info, on='title', how='left')
    # print(similar_restaurants.columns)
  
    return similar_restaurants[['title', 'category_x','latitude_x','thumbnail_y',
                                 'longitude_x' , 'link', 'order_online_y'
                                   ]]

def recommend(title, selected_distance):
    selected_lat, selected_lon = get_latitude_longitude(title)

    recommendations = get_recommendations_with_latlon_and_info(title)

    recommendations['distance'] = recommendations.apply(
        lambda row: haversine(selected_lat, selected_lon, row['latitude_x'], row['longitude_x']),
        axis=1
    )

    # Filter places with a distance less than the selected distance
    recommendations = recommendations[recommendations['distance'] < selected_distance]

   
    recommendation_dict = recommendations.to_json(orient='records')


    # Return the dictionary, which Flask will convert to a JSON response
    return recommendation_dict


# title = "Royal Garden"
# selected_distance = 2 # Replace with your desired maximum distance
# recommend(title=title , selected_distance=selected_distance)

@app.route('/recommend', methods=['POST'])
def recom():
    try:
         # Get the JSON data from the request
        data = request.get_json()

        name = str(data.get('name'))
        distance = float(data.get('distance'))

        print("Name:", name)
        print("Distance:", distance)
        res = recommend(title=name , selected_distance=distance)
        return res ,200
    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500


@app.route('/nearby', methods=['POST'])
def nearby():
    try:
    # Get the JSON data from the request
      data = request.get_json()

      # Access individual fields in the JSON data
      usr_latitude = float(data.get('latitude'))
      usr_longitude = float(data.get('longitude'))
      
      user_location = Point(usr_longitude, usr_latitude)
      
      # Define the search radius in degrees (adjust based on your needs)
      search_radius = 0.01  # For example, a radius of 0.01 degrees (approximately 1.1 kilometers)
      
      # Create a buffer (circle) around the user's location
      buffered_user_location = user_location.buffer(search_radius)
      
      # Perform a spatial query to find places within the buffer
      nearby_places = gdf[gdf.geometry.intersects(buffered_user_location)]

      # Convert the nearby places to a list of dictionaries for JSON serialization
      res =  nearby_places.to_json()

      # Return the result as JSON
      return res, 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500
    
@app.route('/restaurant_data', methods=['GET'])
def restaurantdata():
    try:
      # Convert the nearby places to a list of dictionaries for JSON serialization
      res =  restaurant_data.to_json(orient='records')

      # Return the result as JSON
      return res, 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500



if __name__ == '__main__':
    app.run(debug=True)