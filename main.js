// Initialize Firebase
var config = {
    apiKey: "AIzaSyB890Act2vsX3oJJ95zPDICYPcv-ZXPCEk",
    authDomain: "nightwatch-83e83.firebaseapp.com",
    databaseURL: "https://nightwatch-83e83.firebaseio.com",
    projectId: "nightwatch-83e83",
    storageBucket: "nightwatch-83e83.appspot.com",
    messagingSenderId: "424681918139"
};
firebase.initializeApp(config);
initMap()

// userID/userName/userPhone/userPhoto/UserSex/userLocation{log/lat}
let data = {
    name: null,
    mail: null,
    photo: null,
    gender: null,
    phone: null,
    sos: false,
    loc: {
        lat: null,
        lng: null
    },
    // timestamp: null
}

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            // 23.973875°N 120.982024°E - taiwan center
            lat: 23.973875,
            lng: 120.982024
        },
        zoom: 13,
        styles: [{
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]  // Turn off points of interest.
        }, {
            featureType: 'transit.station',
            stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
        }],
        disableDoubleClickZoom: true
    })
    var infoWindow = new google.maps.InfoWindow({ map: map })

    // Create the DIV to hold the control and call the makeInfoBox() constructor
    // passing in this DIV.
    var infoBoxDiv = document.createElement('div');
    var infoBox = new makeInfoBox(infoBoxDiv, map);
    infoBoxDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }

            infoWindow.setPosition(pos)
            infoWindow.setContent('Your location')
            map.setCenter(pos)
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter())
        })
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter())
    }

    // Listen for clicks and add the location of the click to firebase.
    map.addListener('click', function (e) {
        data.loc = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        }
        data.name = 'Dolphin'
        data.gender = 1
        data.mail = 'hisb50918@gmail.com'
        data.photo = './logo.png'
        data.phone = '0977777777'
        addToFirebase(data);
    });

    var features = [], dangers = [];
    testMap(map)
    fetch('https://opendata2017.herokuapp.com/getDataPoint').then(res => {
        return res.json()
    }).then(jsonRES => {
        jsonRES.gps_point.forEach(p => {
            dangerPin(map, dangers, p)
        })
    })
}

function testMap(map) {
    var locRef = firebase.database().ref('location/');

    let markers = new Map()
    locRef.on('child_added', function (data) {
        if (!data.val().loc) return
        let map_icon_label = `
<svg width="40px" height="63px" viewBox="0 0 40 63" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <filter x="-100.0%" y="-34.9%" width="294.4%" height="179.1%" filterUnits="objectBoundingBox" id="filter-1">
            <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
        </filter>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Desktop-HD" transform="translate(-912.000000, -448.000000)">
            <g id="Page-1" filter="url(#filter-1)" transform="translate(923.000000, 456.000000)">
                <path d="M8.7174,0.9994 C11.3234,0.9994 13.4454,3.1204 13.4454,5.7274 C13.4454,8.3334 11.3234,10.4544 8.7174,10.4544 C6.1114,10.4544 3.9904,8.3344 3.9904,5.7274 C3.9904,3.1204 6.1114,0.9994 8.7174,0.9994" id="Fill-1" class="${data.val().sos ? 'svg-sos' : ''}" fill="${data.val().gender ? '#1B1464':'#9E005D'}"></path>
                <path d="M8.7174,0.9994 C11.3234,0.9994 13.4454,3.1204 13.4454,5.7274 C13.4454,8.3334 11.3234,10.4544 8.7174,10.4544 C6.1114,10.4544 3.9904,8.3344 3.9904,5.7274 C3.9904,3.1204 6.1114,0.9994 8.7174,0.9994 Z" id="Stroke-3" stroke="#FFFFFF" stroke-width="2"></path>
                <path d="M13.5816,11.164 L3.8536,11.164 C1.7286,11.164 -0.0004,12.893 -0.0004,15.017 L-0.0004,24.767 C-0.0004,26.55 1.2006,28.062 2.8746,28.497 L2.8746,38.304 C2.8746,40.403 4.5836,42.11 6.6856,42.11 L10.7506,42.11 C12.8526,42.11 14.5606,40.403 14.5606,38.304 L14.5606,28.497 C16.2346,28.062 17.4356,26.55 17.4356,24.767 L17.4356,15.017 C17.4356,12.893 15.7066,11.164 13.5816,11.164" id="Fill-5" class="${data.val().sos ? 'svg-sos' : ''}" fill="${data.val().gender ? '#1B1464':'#9E005D'}"></path>
                <path d="M13.5816,11.164 L3.8536,11.164 C1.7286,11.164 -0.0004,12.893 -0.0004,15.017 L-0.0004,24.767 C-0.0004,26.55 1.2006,28.062 2.8746,28.497 L2.8746,38.304 C2.8746,40.403 4.5836,42.11 6.6856,42.11 L10.7506,42.11 C12.8526,42.11 14.5606,40.403 14.5606,38.304 L14.5606,28.497 C16.2346,28.062 17.4356,26.55 17.4356,24.767 L17.4356,15.017 C17.4356,12.893 15.7066,11.164 13.5816,11.164 Z" id="Stroke-7" stroke="#FFFFFF" stroke-width="2"></path>
            </g>
        </g>
    </g>
</svg>
        `
        let marker = makeMaker(map, mapIcons.shapes.MAP_PIN, map_icon_label, {
            lat: data.val().loc.lat,
            lng: data.val().loc.lng
        }, data, markers)

        markers.set(data.key, marker)
    });

    locRef.on('child_changed', function (data) {
        let m = markers.get(data.key)
        m.setMap(null)
        let map_icon_label = `
<svg width="40px" height="63px" viewBox="0 0 40 63" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <filter x="-100.0%" y="-34.9%" width="294.4%" height="179.1%" filterUnits="objectBoundingBox" id="filter-1">
            <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
            <feMerge>
                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
        </filter>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Desktop-HD" transform="translate(-912.000000, -448.000000)">
            <g id="Page-1" filter="url(#filter-1)" transform="translate(923.000000, 456.000000)">
                <path d="M8.7174,0.9994 C11.3234,0.9994 13.4454,3.1204 13.4454,5.7274 C13.4454,8.3334 11.3234,10.4544 8.7174,10.4544 C6.1114,10.4544 3.9904,8.3344 3.9904,5.7274 C3.9904,3.1204 6.1114,0.9994 8.7174,0.9994" id="Fill-1" class="${data.val().sos ? 'svg-sos' : ''}" fill="${data.val().gender ? '#1B1464':'#9E005D'}"></path>
                <path d="M8.7174,0.9994 C11.3234,0.9994 13.4454,3.1204 13.4454,5.7274 C13.4454,8.3334 11.3234,10.4544 8.7174,10.4544 C6.1114,10.4544 3.9904,8.3344 3.9904,5.7274 C3.9904,3.1204 6.1114,0.9994 8.7174,0.9994 Z" id="Stroke-3" stroke="#FFFFFF" stroke-width="2"></path>
                <path d="M13.5816,11.164 L3.8536,11.164 C1.7286,11.164 -0.0004,12.893 -0.0004,15.017 L-0.0004,24.767 C-0.0004,26.55 1.2006,28.062 2.8746,28.497 L2.8746,38.304 C2.8746,40.403 4.5836,42.11 6.6856,42.11 L10.7506,42.11 C12.8526,42.11 14.5606,40.403 14.5606,38.304 L14.5606,28.497 C16.2346,28.062 17.4356,26.55 17.4356,24.767 L17.4356,15.017 C17.4356,12.893 15.7066,11.164 13.5816,11.164" id="Fill-5" class="${data.val().sos ? 'svg-sos' : ''}" fill="${data.val().gender ? '#1B1464':'#9E005D'}"></path>
                <path d="M13.5816,11.164 L3.8536,11.164 C1.7286,11.164 -0.0004,12.893 -0.0004,15.017 L-0.0004,24.767 C-0.0004,26.55 1.2006,28.062 2.8746,28.497 L2.8746,38.304 C2.8746,40.403 4.5836,42.11 6.6856,42.11 L10.7506,42.11 C12.8526,42.11 14.5606,40.403 14.5606,38.304 L14.5606,28.497 C16.2346,28.062 17.4356,26.55 17.4356,24.767 L17.4356,15.017 C17.4356,12.893 15.7066,11.164 13.5816,11.164 Z" id="Stroke-7" stroke="#FFFFFF" stroke-width="2"></path>
            </g>
        </g>
    </g>
</svg>
        `
        let marker = makeMaker(map, mapIcons.shapes.MAP_PIN, map_icon_label, {
            lat: data.val().loc.lat,
            lng: data.val().loc.lng
        }, data, markers)
        markers.set(data.key, marker)
        // m.setPosition(new google.maps.LatLng(data.val().loc.lat, data.val().loc.lng))
    });

    locRef.on('child_removed', function (data) {
        console.log('remove!')
        let marker = markers.get(data.key)
        marker.setMap(null);
        markers.delete(data.key)
    });
}

function makeMaker(map, path, map_icon_label, { lat, lng } = position, data, markers) {
    var locRef = firebase.database().ref('location/');
    
    let marker = new mapIcons.Marker({
        position: new google.maps.LatLng(lat, lng),
        icon: {
            path,
            fillColor: '#FFCCBB',
            fillOpacity: 0,
            strokeColor: '',
            strokeWeight: 0
        },
        map_icon_label,
        map
    })

    var contentString = `
        <div class="info">
            <div class="info-photo" style="background-image: url(${data.val().photo})">
            </div>
            <div class="info-name-phone">
              <div class="info-name">${data.val().name}</div>
                <div class="info-phone">${data.val().phone}</div>
            </div>
            <div class="info-phone-btn" onclick="alert('call...')">
                <image src="./phone.svg" width="30" height="30"/>
            </div>
        </div>
        `

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });

    marker.addListener('dblclick', function () {
        locRef.child(data.key).update({
            sos: !data.val().sos
        }).then(res => {
            console.log('update success', res)
        })
    });

    marker.addListener('rightclick', function () {
        locRef.child(data.key).remove()
    });

    return marker
}

// userID/userName/userPhone/userPhoto/UserSex/userLocation{log/lat}

function addToFirebase({ name, gender, photo, loc, phone, sos } = data) {
    firebase.database().ref('location/').push({
        name,
        gender,
        photo,
        loc,
        phone,
        sos
    }).then(res => {
        console.log('push success')
    }, console.error)

}

function dangerPin(map, dangers, { lat, lng } = center) {
    var dangerCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.35,
        strokeWeight: 0,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map,
        center: new google.maps.LatLng(lat, lng),
        radius: 200 // 200 memters
    });
    dangers.push(dangerCircle)
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos)
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.')
}

function makeInfoBox(controlDiv, map) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div')
    controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px'
    controlUI.style.backgroundColor = '#fff'
    controlUI.style.border = '2px solid #fff'
    controlUI.style.borderRadius = '2px'
    controlUI.style.marginBottom = '22px'
    controlUI.style.marginTop = '10px'
    controlUI.style.textAlign = 'center'
    controlDiv.appendChild(controlUI)

    // Set CSS for the control interior.
    var controlText = document.createElement('div')
    controlText.style.color = 'rgb(25,25,25)'
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif'
    controlText.style.fontSize = '100%'
    controlText.style.padding = '6px'
    controlText.innerText = 'NightWatch WEB Monit'
    controlUI.appendChild(controlText)
}


// google map key: AIzaSyDqIKzgQx_yMB-fvxh4-_2YNRrXVDRUlyY