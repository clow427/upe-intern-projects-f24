import React, { useEffect, useRef, useState } from 'react';
import Question from './Question';

function YouTubePlayer({VideoQuiz}) { 

  //gather info from quiz object
  const videoId = VideoQuiz.videoId;
  const questions = VideoQuiz.questions;
  const stopTimes = [];
  questions.forEach(function(item) {
    stopTimes.push(item.time);
  });

  const playerRef = useRef(null);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  
  //question states
  const [showQuestion, setShowQuestion] = useState(false);
  const [index, setIndex] = useState(0); // Manage index as state
  const [correctAnswers, setCorrectAnswers] = useState(0); // correct
  const [next, setNext] = useState("Skip") // next button

  useEffect(() => {

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'controls': 0,
          'modestbranding': 1,
          'showinfo': 0,
          'rel': 0,
          'disablekb': 1,
          'fs': 0,
          'iv_load_policy': 3
        },
        events: {
          'onStateChange': onPlayerStateChange // Track video state changes
        }
      });
    };

    const intervalId = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        checkForTargetPoints(time);
      }
    }, 1000); // Check every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  const startVideo = () => {
    if (playerRef.current) {
      playerRef.current.playVideo();
      playerRef.current.setVolume(volume);
    }
  };

  const stopVideo = () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const checkForTargetPoints = (time) => {
    // Iterate through stopTimes array and check if we should stop
    stopTimes.forEach((targetTime) => {
      if (Math.floor(time) === targetTime) {
        console.log(`Stopping at ${targetTime} seconds`);
        stopVideo(); 
        setShowQuestion(true);
        console.log('STOPPED!!');
        stopTimes.shift();
      }
    });
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      console.log('Video is playing');
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      console.log('Video is paused');
    }
  };

  const nextButton = () => {
    setShowQuestion(false);
    startVideo();
    console.log("started?");
    setIndex((prevIndex) => prevIndex + 1);
    console.log(index);
    console.log(questions[index]);
  };

  const handleNext = (corr) => {
    if(corr) {
      setNext("Hooray! Carry on!");
    }
    else {
      setNext("Aww. Next one!");
    }
  }

  const handleCorrectAnswer = () => {
    setCorrectAnswers(prev => prev + 1);
    handleNext(true);
  }

  const handleWrongAnswer = () => {
    handleNext(false); 
  };

  return (
    <div>
      <div id="player"></div>
      <button onClick={startVideo}>Start</button>
      <button onClick={stopVideo}>Stop</button>
      
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={handleVolumeChange}
      />
      
      <p>Current Time: {Math.floor(currentTime)} seconds</p>
      <div>
        <p> SCORE {correctAnswers}/{stopTimes.length} </p>  
        
      </div>
      {showQuestion && (
        <div>
          <Question
            ques={questions[index].ques}
            opt={questions[index].options}
            ans={questions[index].ans}
            onCorrectAnswer={handleCorrectAnswer}
            onWrongAnswer={handleWrongAnswer}
          />
          <button onClick={nextButton}>{next}</button>
        </div>
      )}

    </div>
  );
}

export default YouTubePlayer;
