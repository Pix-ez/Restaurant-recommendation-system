//@ts-nocheck
import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'
import { Featured } from './components/featured'
import { Popular } from './components/popular'

function App() {
  const [name , SetName] = useState<any | null>('')
  const [distance , SetDistance] = useState<any | null>()
  const [latitude, SetLatitude] = useState<any | null>()
  const [longitude, SetLongitude] = useState<any | null>()
  const [nearby, SetNearby] = useState()
  const[restaurant_data, SetRestaurant_data] = useState()

  // console.log(latitude , longitude)



  useEffect(() => {

    if ("geolocation" in navigator) {
      // Geolocation is available
      navigator.geolocation.getCurrentPosition(function(position) {
        SetLatitude(position.coords.latitude)
        SetLongitude(position.coords.longitude)

        // const latitude = position.coords.latitude;
        // const longitude = position.coords.longitude;
    
        // console.log("Latitude: " + latitude);
        // console.log("Longitude: " + longitude);
  
      }, function(error) {
        // Handle errors
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            console.error("The request to get user location timed out.");
            break;
        
        }
      });
    } else {
      // Geolocation is not available in this browser
      console.error("Geolocation is not available in this browser.");
    }

   

  }, [])

 
  // Fetch nearby data when latitude and longitude are available
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      Nearby();
      restaurantdata()
    }
  }, [latitude,longitude]);
  
  const Nearby=()=>{
   
    if(latitude && longitude){
      
      
      // const formData = new FormData();
      // formData.append('name', name );
      // formData.append('distance', distance );

     

      const payload = {
        "latitude": latitude,
        "longitude": longitude
      };
      // console.log(payload)


      axios.post("http://127.0.0.1:5000/nearby",payload ,{
      headers:{'Content-Type': 'application/json'},
    })
    
    .then(data=>{
      SetNearby(data.data.features)
      
      console.log(data.data.features)
      // console.log(data.data.features[0].properties.title)
  })
    .catch((error)=>{
      console.log(error)
    })

    } else{
      // alert("Enter everything 😒😒")
    }

  }

  const restaurantdata=()=>{
  
      axios.get("http://127.0.0.1:5000/restaurant_data",{
      headers:{'Content-Type': 'application/json'},
    })
    
    .then(data=>{
      SetRestaurant_data(data.data)
      
      console.log(data.data)
      // console.log(data.data.features[0].properties.title)
  })
    .catch((error)=>{
      console.log(error)
    })

   
  }
 

  const Recommend=(event:any)=>{
    event.preventDefault()
    if(name && distance){
      
   

     

      const payload = {
        "name": name,
        "distance": distance
      };
      console.log(payload)

      axios.post("http://127.0.0.1:5000/recommend",payload ,{
      headers:{'Content-Type': 'application/json'},
    })
    
    .then(data=>{
      console.log(data.data)
  })
    .catch((error)=>{
      console.log(error)
    })

    } else{
      alert("Enter everything 😒😒")
    }

  }


  return (
    <>
      <div>
        <h1 className=' text-center text-3xl font-semibold ' >Your Location Latitude{latitude}, Longitude{longitude}</h1>
        <span>Name</span>
        <input name='ENTER NAME' onChange={(event)=>SetName(event.target.value)}/>

        <span className=''>Distance</span>
        <input name='ENTER Distance'  onChange={(event)=>SetDistance(event.target.value)}/>
     
        <button onClick={Recommend}>Recommend</button>
        

     
      </div>
      <h1 className='text-purple-800 font-bold m-4 border-yellow-600 border-2 p-2'>Top Places in your location</h1>
      <div className='flex flex-row gap-3'>
      {nearby && nearby.length > 0 ? (
        nearby.map((item, index) => (
          <Featured
            key={index} // Use a unique key when mapping over an array
            title={item.properties.title}
            link={item.properties.link}
            img={item.properties.thumbnail}
            online={item.properties.order_online}
          />
        ))
      ) : (
        <p>No nearby items to display.</p>
      )}
    </div>
    <h1 className='text-purple-800 font-bold m-4 border-yellow-600 border-2 p-2'>Popular Restaurant </h1>
    <div className='flex flex-wrap flex-row gap-2'>
      {restaurant_data && restaurant_data.length > 0 ? (
        restaurant_data.map((item, index) => (
          <Popular
            key={index} // Use a unique key when mapping over an array
            title={item.title}
            link={item.link}
            img={item.thumbnail}
            online={item.order_online}
          />
        ))
      ) : (
        <p>No nearby items to display.</p>
      )}
    </div>

    </>
  )
}

export default App
