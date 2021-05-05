const API_KEY = '349adfe04241534f6ed0cfe457001bf0';

const defaultRequest = {
    lat: 51.5085,
    lon: -0.1257,
    appid: API_KEY
}
let simpleRequest = {
    q: 'London',
    lat: 51.5085,
    lon: -0.1257,
    appid: API_KEY
}

const generateEmptyTemplate = () => {
    return document.querySelector('#favourite-city-template').content;
}
let currentSection = document.body.querySelector('.current');
let favouriteSection = document.body.querySelector('.favourite');

const setLoadingCurrent = (flag) => {
    let geoLoader = document.querySelector('.loading-geo');
    if (!flag) {
        currentSection.classList.remove('invisible');
        geoLoader.classList.add('invisible');
    } else {
        geoLoader.classList.remove('invisible');
        currentSection.classList.add('invisible');
    }
}
const setLoadingFav = (flag) => {
    let favLoader = document.querySelector('.loading-fav');
    if (!flag) {
        favouriteSection.classList.remove('invisible');
        favLoader.classList.add('invisible');
    } else {
        favLoader.classList.remove('invisible');
        favouriteSection.classList.add('invisible');
    }
}

const iconUrl = (code) => { return `http://openweathermap.org/img/wn/${code}@2x.png` }
const convertDeg = (temperature) => { return Math.round(temperature) }

//buttons
let updateLocation = document.body.querySelector('.header__button');
let deleteCity = document.body.querySelector('.city-header_button');

const currentToDOM = (cityInfo) => {
    currentSection.querySelector('.city_name').innerHTML = cityInfo.name;
    currentSection.querySelector('.degree').innerHTML = `${convertDeg(cityInfo.main.temp)}&degC`;
    currentSection.querySelector('.icon').setAttribute('src', iconUrl(cityInfo.weather[0].icon));
    addCityParams(currentSection.querySelector('.details'), cityInfo)
}

const addCityParams = (searchParams, weatherData) => {
    let paramArray = searchParams.querySelectorAll('.details_item')

    paramArray[0].querySelector('.details_item__name').innerHTML  = 'Ветер'
    paramArray[1].querySelector('.details_item__name').innerHTML  = 'Облачность'
    paramArray[2].querySelector('.details_item__name').innerHTML  = 'Давление'
    paramArray[3].querySelector('.details_item__name').innerHTML  = 'Влажность'
    paramArray[4].querySelector('.details_item__name').innerHTML  = 'Координаты'

    paramArray[0].querySelector('.details_item__value').innerHTML  = weatherData.wind.speed
    paramArray[1].querySelector('.details_item__value').innerHTML  = weatherData.clouds.all
    paramArray[2].querySelector('.details_item__value').innerHTML  = weatherData.main.pressure
    paramArray[3].querySelector('.details_item__value').innerHTML  = weatherData.main.humidity
    paramArray[4].querySelector('.details_item__value').innerHTML  = '[ ' + weatherData.coord.lat + ', ' + weatherData.coord.lon + ' ]'
}

function setDefaultCity(){
    weatherByCityName('London')
        .then((data) => {
            if(data != null) { currentToDOM(data); }
    });
}
function weatherByCityName(city){
    return fetch(`http://localhost:3000/weather/city?q=${city}`)
        .then((response) => {
            if(response.ok){
                return response.json();
            }
            if(response.status === 404){
                alert('Not found!');
            }
            if(response.status === 500){
                alert('Connection problem!');
            }
        })
}

function weatherByCoords(lon, lat){
    return fetch(`http://localhost:3000/weather/coordinates?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then((response) => {
            if(response.ok){
                return response.json();
            }
            if(response.status === 404){
                alert('Not found!');
            }
            if(response.status === 500){
                alert('Connection problem!');
            }
        })
}

function favList()  {
    return fetch('http://localhost:3000/favourites/list')
        .then((response) => {
            if(response.ok){
                return response.json();
            }
        })
}

function showFavouriteCities(){
    favList().then((data) => {
        data.forEach(city => {
            addNewCity(city.name, false);
        });
    });
}

function currentGeo() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    }
    else {
        alert('Impossible to get your geolocation');
        setLoadingCurrent(true);
        let response = weatherByCityName('London');
        if (response != null) {
            currentToDOM(response);
        }
        setLoadingCurrent(false);
    }
}
const success = async (position) => {
    setLoadingCurrent(true);
    const response = await  weatherByCoords(position.coords.longitude, position.coords.latitude);
    currentToDOM(response);
    setLoadingCurrent(false);
}
const error = async (err) => {
    alert(`ERROR(${err.code}): ${err.message}`);
    setLoadingCurrent(true);
    const response = await weatherByCityName('London');
    if (response != null) {
        currentToDOM(response);
    }
    setLoadingCurrent(false);
}


function addNewCity(city, isNew) {
    city = city.charAt(0).toUpperCase() + city.substr(1).toLowerCase();
    let favList = document.querySelector('.favourite-list');
    setLoadingFav(true);
    weatherByCityName(city)
        .then((data) => {
            if (data != null) {
                if (isNew) {
                    return fetch(`http://localhost:3000/favourites/add?q=${city}`, {method: 'POST'})
                        .then((response) => {
                            if (response.ok) { //заполняем новый город
                                let template = generateEmptyTemplate();
                                let favouriteCity = document.importNode(template, true);
                                favouriteCity.querySelector('.city_name').setAttribute('custom_id', data.id);
                                attachRemoveEvents(favouriteCity.querySelector('.delete'), city);
                                favouriteCity.querySelector('.city_name').innerHTML = data.name;
                                favouriteCity.querySelector('.degree').innerHTML = `${convertDeg(data.main.temp)} &degC`;
                                favouriteCity.querySelector('.icon').setAttribute('src', iconUrl(data.weather[0].icon));
                                addCityParams(favouriteCity, data)
                                favList.appendChild(favouriteCity);
                            }
                            if (response.status === 400) {
                                alert('Already added');
                            }
                        })
                        .catch((err) => {
                        })
                } else {
                    let template = generateEmptyTemplate();
                    let favouriteCity = document.importNode(template, true);
                    favouriteCity.querySelector('.city_name').setAttribute('custom_id', data.id);
                    attachRemoveEvents(favouriteCity.querySelector('.delete'), city);
                    favouriteCity.querySelector('.city_name').innerHTML = data.name;
                    favouriteCity.querySelector('.degree').innerHTML = `${convertDeg(data.main.temp)} &degC`;
                    favouriteCity.querySelector('.icon').setAttribute('src', iconUrl(data.weather[0].icon));
                    addCityParams(favouriteCity, data)
                    favList.appendChild(favouriteCity);
                }
            }
        })
    setLoadingFav(false);
}


/*const addNewCity = async (cityName, isNew) => {
    let favList = document.querySelector('.favourite-list');
    simpleRequest.q = cityName;
    if (simpleRequest.lat && simpleRequest.lon) {
        delete simpleRequest.lat;
        delete simpleRequest.lon;
    }
    setLoadingFav(true);

    //здесь по городу
    // URL = 'https://api.openweathermap.org/data/2.5/weather?'

    let NEW_URL = `http://localhost:3000/weather/city?q=${cityName}`

    let response = await getCityJSON(NEW_URL);
    if (response.ok && isNew) {
        // localStorage.setItem(response.id, cityName);
        let template = generateEmptyTemplate();
        let favouriteCity = document.importNode(template, true);
        favouriteCity.querySelector('.city_name').setAttribute('custom_id', response.id);
        attachRemoveEvents(favouriteCity.querySelector('.delete'));
        favouriteCity.querySelector('.city_name').innerHTML = response.name;
        favouriteCity.querySelector('.degree').innerHTML = `${convertDeg(response.main.temp)} &degC`;
        favouriteCity.querySelector('.icon').setAttribute('src', iconUrl(response.weather[0].icon));
        addCityParams(favouriteCity, response)
        favList.appendChild(favouriteCity);
    }
    if (response.status === 400) {
        alert('Already added');
    }
    if (response.id && localStorage.getItem(response.id) !== null && isNew){
        alert('Already added');
    } else {
        localStorage.setItem(response.id, cityName);
        let template = generateEmptyTemplate();
        let favouriteCity = document.importNode(template, true);
        favouriteCity.querySelector('.city_name').setAttribute('custom_id', response.id);
        attachRemoveEvents(favouriteCity.querySelector('.delete'));
        favouriteCity.querySelector('.city_name').innerHTML = response.name;
        favouriteCity.querySelector('.degree').innerHTML = `${convertDeg(response.main.temp)} &degC`;
        favouriteCity.querySelector('.icon').setAttribute('src', iconUrl(response.weather[0].icon));
        addCityParams(favouriteCity, response)
        favList.appendChild(favouriteCity);
    }
    setLoadingFav(false);
}*/

/*setFavorites = () => {
    if (localStorage.length === 0) {
        setLoadingFav(false);
    }
    else {
        for (let i = 0; i < localStorage.length; i++) {
            addNewCity(localStorage.getItem(localStorage.key(i)), false);
        }
    }
}*/


const attachAddEvents = () => {
    const input = document.querySelector('#new-city');
    let addCityBtn = document.body.querySelector('.favourite_new-city_button');
    addCityBtn.addEventListener('click', event => {
        event.preventDefault();
        if (input.value === ''){
            alert('Write smth');
            return;
        }
        addNewCity(input.value, true);
        input.value = '';
    })
}

const attachRemoveEvents = (removeBtn, city) => {
    removeBtn.addEventListener('click', (event) => {
        event.preventDefault();
        return fetch(`http://localhost:3000/favourites/delete?q=${city}`, {method: 'DELETE'})
            .then((response) => {
                if (response.ok) {
                    const mainList = removeBtn.parentNode.parentNode.parentNode;
                    if (removeBtn.parentNode.parentNode) {
                        mainList.removeChild(removeBtn.parentNode.parentNode);
                    }
                }
            })
            .catch((err) => {});
    })
}


updateLocation.addEventListener('click', async ()=> {
    await currentGeo();
});

currentGeo();
showFavouriteCities();
attachAddEvents();