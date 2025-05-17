import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { API_BASE_URL } from '../services/config';

const FaceRecognition = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelPath = window.location.origin + '/models';
        console.log('Loading models from:', modelPath);
        
        // Check if model files exist before loading
        const checkModelFile = async () => {
          const response = await fetch(`${modelPath}/tiny_face_detector_model-weights_manifest.json`);
          if (!response.ok) throw new Error('Model files not found');
          return response.json();
        };

        await checkModelFile(); // Verify model files exist
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
        await faceapi.nets.faceExpressionNet.loadFromUri(modelPath);
        
        console.log('Modèles chargés avec succès');
      } catch (error) {
        console.error('Erreur lors du chargement des modèles:', error);
        alert('Erreur lors du chargement des modèles de détection faciale.');
      }
    };

    loadModels();

    // Cleanup function to stop media tracks when component unmounts
    return () => {
      if (webcamRef.current && webcamRef.current.stream) {
        const tracks = webcamRef.current.stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const capture = async () => {
    try {
      if (!webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        console.error('Failed to capture image');
        return;
      }

      setImage(imageSrc);
      setIsLoading(true);

      const img = new Image();
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load captured image'));
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      if (!ctx) throw new Error('Failed to get canvas context');

      ctx.drawImage(img, 0, 0, img.width, img.height);

      const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions());
      console.log('Detections:', detections);
      setFaceDetected(detections.length > 0);
      setIsValid(detections.length > 0);
      setIsLoading(false);

      if (detections.length > 0) {
        await saveFaceData(detections, imageSrc);
      }
    } catch (error) {
      console.error('Error capturing or processing image:', error);
      setIsLoading(false);
      setIsValid(false);
    }
  };

  const saveFaceData = async (detections, imageData) => {
    try {
        const userData = JSON.parse(localStorage.getItem('currentUser'));
        const response = await fetch(`${API_BASE_URL}/Face/face-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.token}`
            },
            body: JSON.stringify({
                userId: userData.id,
                imageData: imageData,
                detections: detections
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Face data saved successfully:', data);
        return true;
    } catch (error) {
        console.error('Error saving face data:', error);
        return false;
    }
};

  const handleRetake = () => {
    setImage(null);
    setFaceDetected(false);
    setIsValid(true);
  };

  const handleNextStep = () => {
    if (faceDetected) {
      navigate('/account-creation');
    } else {
      alert('Aucun visage détecté. Veuillez capturer une nouvelle image.');
    }
  };

  const handleWebcamError = (error) => {
    console.error('Webcam error:', error);
    alert('Problème avec la webcam: ' + error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Capture du visage</h2>

        {!image ? (
          <div className="relative flex justify-center items-center w-full h-72 bg-gray-200 rounded-lg overflow-hidden">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              onUserMediaError={handleWebcamError}
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: 'user' }}
            />
          </div>
        ) : (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Image capturée</h3>
            <img
              src={image}
              alt="Visage"
              className="mt-2 w-full h-52 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {!image ? (
          <button
            onClick={capture}
            className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
          >
            Capturer
          </button>
        ) : (
          <button
            onClick={handleRetake}
            className="mt-4 bg-yellow-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-all duration-200"
          >
            Refaire la photo
          </button>
        )}

        {isLoading && (
          <div className="mt-4 text-gray-700">Analyse du visage...</div>
        )}

        {!isValid && (
          <div className="mt-4 text-red-500">Aucun visage détecté. Veuillez réessayer.</div>
        )}

        {faceDetected && (
          <div className="mt-4 text-green-500">Visage détecté avec succès !</div>
        )}

        <button
          onClick={handleNextStep}
          className={`mt-6 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 ${!faceDetected ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!faceDetected}
        >
          Étape suivante →
        </button>
      </div>
    </div>
  );
};

export default FaceRecognition;