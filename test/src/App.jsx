import React, { useState } from 'react';
import axios from 'axios';
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [results, setResults] = useState(null);

  const handleImageUpload = event => {
    setSelectedImage(URL.createObjectURL(event.target.files[0]));

    const formData = new FormData();
    formData.append('image', event.target.files[0]);

    axios.post('http://localhost:5000/v1/object-detection/yolov5', formData, { responseType: 'arraybuffer' })
      .then(response => {
        const annotatedImageSrc = `data:image/png;base64,${arrayBufferToBase64(response.data)}`;
        setAnnotatedImage(annotatedImageSrc);
        setResults("Image successfully processed");
      })
      .catch(error => {
        alert("enter a valid image");
        setResults("Error processing the image");
      });
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return (
    <>
      <div>
        <h1>Object Detection using YOLO v5</h1>
        <div className="card">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <div>
          {selectedImage && !annotatedImage && <img src={selectedImage} alt="Selected" style={{maxWidth:"600px"}}/>}
          {annotatedImage && <img src={annotatedImage} alt="Annotated" style={{maxWidth:"600px"}}/>}
          </div>
          {results && <p>{results}</p>}
        </div>
      </div>
    </>
  );
}

export default App;
