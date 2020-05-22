import React, { Component } from  'react';
import Clarifai  from 'clarifai';
import Particles from 'react-particles-js';
import Navigation from './Navigation';
import FaceRecognition from './FaceRecognition';
import Logo from './Logo';
import ImageLinkForm from './ImageLinkForm';
import Sign from './Sign';
import Register from './Register';
import Rank from './Rank';
import './App.css';

const app = new Clarifai.App({
  apiKey: '1aa146ec6e564adda83e4c82693fcd13'
 });
 
const particleOptions = {
  particles: {
    number: {
      value: 500,
      density: {
        enable: true,
        value_area: 2000
      }
    }
  }
}

 const initialState ={
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
       id: '',
       name: '',
       email: '',
       entries: 0,
       joined: ''
      }
    }
class App extends Component  {
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
     }})
  }
  
  
  calculateFaceLocation = (data) => {
     const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
     const image = document.getElementById('inputimage');
     const width = Number(image.width);
     const height = Number(image.height);
     return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
     }


  }

     displayFaceBox = (box) =>{
       this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }
  onButtonSubmit = () => {
   this.setState({imageUrl: this.state.input})
   app.models.predict(
     Clarifai.FACE_DETECT_MODEL,
     this.state.input)
     .then(response => {
       if(response)
       {
         fetch('http://localhost:3000/image' , {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          id: this.state.user.id
           })
         })
         .then(response => response.json() )
         .then(count => {
           this.setState(Object.assign(this.state.user, { entries: count}))
         })
       }
       this.displayFaceBox(this.calculateFaceLocation(response))
     })
     .catch(err => console.log(err));
  }
    
      //console.log(response.outputs[0].data.regions[0].region_info.boundary_box);

      // do something with response
    onRouteChange = (route) => {
      if(route === 'signout')
      {
        this.setState(initialState)
      } else if(route === 'home')
      {
        this.setState({isSignedIn: true})
      }
      this.setState({route: route});
    }
    
  
  
  render(){
    
    return (
     
       <div className="App">
          <Particles className = 'particles'
      params={particleOptions} />
       <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
       {this.state.route === 'home'
       ?<div>
       <Logo />
       <Rank 
        name={this.state.user.name}
        entries={this.state.user.entries}
       />
       <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
       <FaceRecognition box={this.state.box}  imageUrl={this.state.imageUrl} />
       </div>
       :(
         this.state.route === 'signin'
         ?<Sign loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
         : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
       )
         
         
       }
       </div>

  );
}

}




export default App;