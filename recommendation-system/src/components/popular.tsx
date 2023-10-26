// @ts-nocheck
import { useEffect, useState } from 'react'
import Modal from 'react-modal';
import axios from 'axios'
Modal.setAppElement('#root'); // Set the root element as the app element

export const  Popular= ({ title, link, img, online }) =>{

  const customStyles = {
    content: {
      backgroundColor: 'rgba(15, 23, 42, 1',
    },
  };
    // State to track whether the recommendation popup is open
  const [isRecommendationOpen, setRecommendationOpen] = useState(false);
  const [recommendationData, setRecommendationData] = useState(null);

  // Function to handle the "Recommend Similar" button click
  const handleRecommendationClick = () => {
    // Open the recommendation popup
    setRecommendationOpen(true);
    document.body.classList.add('modal-open'); // Add this line
     // Fetch data from your API
     fetchRecommendationData(title);
  };

  // Function to close the recommendation popup
  const closeRecommendationPopup = () => {
    setRecommendationOpen(false);
    document.body.classList.remove('modal-open'); // Add this line
  };


  const fetchRecommendationData = (name) => {
    // Make an API request to fetch recommendation data
    

    const payload = {
        "name": name,
        "distance": 1
      };
      // console.log(payload)

      axios.post("http://127.0.0.1:5000/recommend",payload ,{
      headers:{'Content-Type': 'application/json'},
    })
    
    .then(data=>{
        setRecommendationData(data.data)
      console.log(data.data)
  })
    .catch((error)=>{
      console.log(error)
    })
  };
    return(<>

    <div className='flex flex-col bg-slate-600 rounded-2xl p-1'>
        <h1 className=' text-center text-lg font-semibold'>{title}</h1>
        <a href={link} target="_blank">Maps Link</a>
        <img src={img} alt={title} className='p-2 rounded-lg  h-52 w-72' />
        <a href={online} target="_blank">Order Online</a>
        <button onClick={handleRecommendationClick}>Recommend Similar</button>
    </div>
  {/* Recommendation modal */}
  <Modal
        isOpen={isRecommendationOpen}
        onRequestClose={closeRecommendationPopup}
        contentLabel="Recommendation Modal"
        style={customStyles}
      ><h2 className='text-center font-semibold text-xl p-1'>Similar Recommendations</h2>
       <div className='flex flex-wrap flex-row gap-2 bg-' >
         {recommendationData && recommendationData.length > 0 ? (
        recommendationData.map((item, index) => (
            <div className="modal-content" className='flex flex-col bg-slate-600 rounded-2xl p-1' key={index}>
             <h1 className=' text-center text-lg font-semibold'>{item.title}</h1>
             <p>Category- {item.category_x}</p>
             <a href={item.link}  target="_blank">Maps Link</a>
             <img src={item.thumbnail_y} alt={item.title} className='p-2 rounded-lg  h-52 w-72' />
             <a href={item.order_online_y} target="_blank" className='m-2 p-1 font-bold'>Order online</a>
           
            <button onClick={closeRecommendationPopup}>Close</button>
          </div>
          
        ))
      ) : (
        <p>Loading......</p>
      )}
      </div>
       
      </Modal>
    </>)
}