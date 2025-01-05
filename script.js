'use strict';



const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


//let map , mapEvent;

// if(navigator.geolocation){
//     navigator.geolocation.getCurrentPosition(function(position){
//         const {latitude} = position.coords;
//         const{longitude} = position.coords;
//         console.log(latitude,longitude);
//         console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

//         const coords = [latitude,longitude];

//          map = L.map('map').setView(coords, 13);
//           //console.log(map);
//         L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution:
//              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         }).addTo(map);

//       // handling clicks on map
//        // console.log(position);
//         map.on('click',function(mapE){
//             mapEvent=mapE;
//         form.classList.remove('hidden');
//         inputDistance.focus();

//         // console.log(mapEvent);
//         // const {lat,lng} =  mapEvent.latlng;

//         // L.marker([lat,lng])
//         // .addTo(map)
//         // //.bindPopup('Workout')
//         // .bindPopup(L.popup({
//         //     maxWidth: 250,
//         //     minWidth: 100,
//         //     autoClose : false,
//         //     closeOnClick : false,
//         //     className : 'running-popup',

//         // }))
//         // .setPopupContent('Workout')
//         // .openPopup();
//        })
//     }, 
// function(){
//     alert('could not get your position');
// })    
// };


// form.addEventListener('submit',function(e){
//     e.preventDefault();
   
//     //clear input fields

//     inputDistance.value=inputCadence.value=inputDuration.value=inputElevation.value='';
//      // display marker
//         console.log(mapEvent);
//         const {lat,lng} =  mapEvent.latlng;
//         L.marker([lat,lng])
//         .addTo(map)
//         //.bindPopup('Workout')
//         .bindPopup(L.popup({
//             maxWidth: 250,
//             minWidth: 100,
//             autoClose : false,
//             closeOnClick : false,
//             className : 'running-popup',

//         }))
//         .setPopupContent('Workout')
//         .openPopup();
// });

// inputType.addEventListener('change',function(){
//     inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
//     inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

// });


// managed classes

class Workout{
    date = new Date();
    id = (Date.now() + '').slice(-10); 

    constructor(coords, distance, duration){
        this.coords =coords;  //[lat,lng]
        this.distance = distance;
        this.duration = duration;
    }
    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
          months[this.date.getMonth()]
        } ${this.date.getDate()}`;
      }
    
}

class running extends Workout{
    type = 'running';
    constructor(coords , distance , duration, cadence){
        super(coords , distance , duration);
        this.cadence =cadence;
        this.calcpace();
        this._setDescription();
    }

    calcpace(){
        //min/km
        this.pace = this.duration /this.distance ;
        return this.pace;
    }
   
}

class cycling extends Workout{
    type = 'cycling';
    constructor(coords , distance , duration, elevationgain){
        super(coords , distance , duration);
        this.elevationgain = elevationgain;
        // this.type = cycling;
        this.calcspeed();
        this._setDescription();

    }

    calcspeed(){
        //km/hr
        this.speed = this.distance / (this.duration/60);
        return this.speed;
    }
}
// const run1= new running([39,-12],5.2,24,178);
// const cycling1= new cycling([39,-12],27,95,523);
// console.log(run1,cycling1);


/////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE

class App{

    #map;
    #mapEvent;
    #mapZoomLevel =13;
    #workout =[];
    constructor(){
        
        this._getposition();
        // get data from local storage
        this._getLocalStorage();

        form.addEventListener('submit',this._newworkout.bind(this));
        inputType.addEventListener('change',this._toggleelevationfield);
        containerWorkouts.addEventListener('click',this._movetopopup.bind(this));

    }

    _getposition(){
        if(navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._loadmap.bind(this), 
        function(){
            alert('could not get your position');
        });    
        
        
    }

    _loadmap(position){  // receive position
        
            const {latitude} = position.coords;
            const{longitude} = position.coords;
            console.log(latitude,longitude);
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    
            const coords = [latitude,longitude];
    
             this.#map = L.map('map').setView(coords, this.#mapZoomLevel);  //(coords, 13)
              //console.log(map);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                 '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
    
          // handling clicks on map
           // console.log(position);
            this.#map.on('click',this._showform.bind(this));

            this.#workout.forEach(work=>{
              
               this._renderWorkoutmarker(work);
               });   

    }

    _showform(mapE){
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideform(){
        //empty inputs
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(()=> (form.style.display ='grid'),1000);
    }
    _toggleelevationfield(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    //////////////////

    _newworkout(e){

        const validInputs=(...inputs)=> 
            inputs.every(inp => Number.isFinite(inp));
        
        const allPositive =(...inputs) => 
            inputs.every(inp => inp>0);
        
        e.preventDefault();
// get  data from form 

        const type = inputType.value;
        const distance =  Number(inputDistance.value);
        const duration =  Number(inputDuration.value) ;
        const { lat, lng} =  this.#mapEvent.latlng;
        let workout;

        
//if activity running , cretee running objects

        if(type === 'running'){
            const cadence = Number(inputCadence.value);
// check if data is valid
            if(
                // !Number.isFinite(distance)
                // || !Number.isFinite(duration)
                // || !Number.isFinite(cadence)
                !validInputs(distance,duration,cadence)  || 
                !allPositive(distance,duration,cadence)
            )
                return alert('Inputs have to be positive number');
             workout = new running([lat,lng],distance,duration,cadence);
            //this.#workout.push(workout);
        }
 //if activity cycling, cretee cycling objects

        if(type === 'cycling'){
            const elevation = +inputElevation.value;
            if(
                !validInputs(distance,duration,elevation)  || 
                !allPositive(distance,duration)
            )
                return alert('Inputs have to be positive number');
                workout = new cycling([lat,lng],distance,duration,elevation);

        }
//add new object to workout array
            this.#workout.push(workout);
            console.log(workout);
//render workout on mapp as marker

        // console.log(this.#mapEvent);
        // //const {lat,lng} =  this.#mapEvent.latlng;
        // L.marker([lat,lng])
        // .addTo(this.#map)
        // //.bindPopup('Workout')
        // .bindPopup(L.popup({
        //     maxWidth: 250,
        //     minWidth: 100,
        //     autoClose : false,  // convert this part in other function
        //     closeOnClick : false,
        //     className : `${type}-popup`,
        // }))
        // .setPopupContent('Workout')
        // .openPopup();

        this._renderWorkoutmarker(workout);
     
// render workout on list
   this._renderWorkout(workout);
//hide form + clear input field
       this._hideform();
       //inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =


//set local storage to all workouts
    this._setlocalstorage();
    }

    _renderWorkoutmarker(workout){
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose : false,
            closeOnClick : false,
            className : `${workout.type}-popup`,
        }))
        .setPopupContent(`${workout.type ==='running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
        .openPopup();
    }

    _renderWorkout(workout){

        let html =`
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          `;
          
     if(workout.type === 'running')
        html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
        </div>
    </li>
          
     `;
     if(workout.type === 'cycling')
        html +=`
     <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationgain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
        `;

        form.insertAdjacentHTML('afterend',html);
    }
    _movetopopup(e){
        if (!this.#map) return;
         const workoute1 = e.target.closest('.workout');
         console.log(workoute1);

         if (!workoute1) return;
         const workout = this.#workout.find(
            work => work.id === workoute1.dataset.id
          );
      
          this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
              duration: 1,
            },
          });

    }
// local storage is an api web
    _setlocalstorage(){
        localStorage.setItem('workouts',JSON.stringify(this.#workout));   // JSON.stringify  converts the objects to string
    }

    _getLocalStorage(){
       const data= JSON.parse(localStorage.getItem('workouts'));
       console.log(data);

       if(!data) return;

       this.#workout = data;

       this.#workout.forEach(work=>{
        this._renderWorkout(work);
       //this._renderWorkoutmarker(work);
       });
    }


    reset(){
        localStorage.removeItem('workouts');
        location.reload();
    }
}

const app = new App();
//app._getposition();
    
