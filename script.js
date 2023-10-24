'use strict';
const GiveAppIntro = async function(){
    alert(`
📌Mark your Tasks and Travel plans on map by clicking anywhere in map
step 1: Click anywhere in map
step 2: Fill Details about plan
step 3: Press Enter and your plan is saved!

🔓Important : Enable location access to browser
`);
}

GiveAppIntro();


// prettier-ignore

const form = document.querySelector('.form');
const containerPlans= document.querySelector('.plans');
const inputType = document.querySelector('.form__input--type');
const inputDate = document.querySelector('.form__input--date');
const inputDuration = document.querySelector('.form__input--duration');
const inputNote = document.querySelector('.form__input--note');

class Plan{
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(type, coords, note, duration){
        this.type = type;
        this.coords = coords;
        this.note = note;
        this.duration = duration;
        this._setTitle();
    }

    _setTitle(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.title = `${this.note} for ${ this.duration} hrs`;
    }
}


class App{
    #map;
    #mapEvent;
    #plans = [];
    #mapZoomLevel =13;

    constructor(){
        this._getPosition();
        form.addEventListener('submit',this._newPlan.bind(this));
        containerPlans.addEventListener("click",this._moveToPin.bind(this));
    }
    _getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), this._failureInPosition.bind(this));
        }
    }

    _loadMap(position){
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        const coords = [latitude, longitude];
        // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        
        this.#map.on("click", this._showForm.bind(this));
    }

    _showForm(mapEv){
        this.#mapEvent = mapEv;
        form.classList.remove('hidden');
        inputNote.focus();      
    }

    _newPlan(ev){
        const {lat,lng} = this.#mapEvent.latlng;

        // prevent refresh when form is submitted
        ev.preventDefault();

        // Get data from the form
        const type = inputType.value;    
        const date = inputDate.value;    
        const duration = +inputDuration.value;     
        const note = inputNote.value;   
        
        // Data validation
        if(!Number.isFinite(duration) || duration<=0)  return alert("Entered Duration is not valid!");
        if(note == "") return alert("Note is empty! Please enter valid note");
        
        // Pushing new plan to plans array
        const plan = new Plan(type,[lat,lng],note,duration);
        this.#plans.push(plan);

        // Clear + hide form
        inputDate.value = inputDuration.value = inputNote.value =  "";
        form.classList.add('hidden');

        // Display marker
        L.marker(plan.coords).addTo(this.#map)
        .bindPopup(L.popup({
            maxwidth : 250,
            minwidth : 100,
            autoClose : false,
            closeOnClick : false,
            className : `${type}-popup`
        }))
        .setPopupContent(`${note} on ${date}`)
        .openPopup();

        // show plan in list
        showPlanInList(plan);
        function showPlanInList(pl){
            console.log(pl);
            let htmls = `
        <li class="workout workout--${pl.type}" data-id="${pl.id}">
          <h2 class="workout__title">${pl.title}</h2>
        </li>    
        `;
        form.insertAdjacentHTML('afterend', htmls);
        }

    }

    _failureInPosition(){
        alert("could not get your position!");
    }

    _moveToPin(ev){
        const planElem = ev.target.closest(".workout");
        console.log(planElem);
        if(!planElem)   return;

        const pln = this.#plans.find(
            pl => pl.id === planElem.dataset.id
        )
        console.log(pln);

        this.#map.setView(pln.coords, this.#mapZoomLevel, {
            animate : true,
            pan : {duration: 1}
        })

    }

}

const app = new App();

const helpBtn = document.querySelector(".help");
helpBtn.addEventListener("click", function(ev){
    ev.preventDefault();
    GiveAppIntro();
});

   



