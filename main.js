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
        data.photo = 'QQQQ'
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
        let map_icon_label = `<span class="map-icon ${data.val().gender ? 'map-icon-male' : 'map-icon-female'} ${data.val().sos ? 'map-sos' : ''}"></span>`
        let marker = makeMaker(map, mapIcons.shapes.MAP_PIN, map_icon_label, {
            lat: data.val().loc.lat,
            lng: data.val().loc.lng
        })
        var contentString = `
        <div>
            <p><strong>Name:</strong> ${data.val().name}</p>
            <p><strong>Phone:</strong> ${data.val().phone}</p>
            <p><strong>Gender:</strong> ${data.val().gender ? '男' : '女'}</p>
        </div>
        `

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        marker.addListener('click', function () {
            // infowindow.open(map, marker);
            console.log(data.val())
            locRef.child(data.key).update({
                sos: !data.val().sos
            }).then(res => {
                console.log('update success', res)
            })
        });

        marker.addListener('rightclick', function () {
            locRef.child(data.key).remove()
        });

        markers.set(data.key, marker)
    });

    locRef.on('child_changed', function (data) {
        let m = markers.get(data.key)
        m.setMap(null)
        let map_icon_label = `<span class="map-icon ${data.val().gender ? 'map-icon-male' : 'map-icon-female'} ${data.val().sos ? 'map-sos' : ''}"></span>`
        let marker = makeMaker(map, mapIcons.shapes.MAP_PIN, map_icon_label, {
            lat: data.val().loc.lat,
            lng: data.val().loc.lng
        })
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

function makeMaker (map, path, map_icon_label, { lat, lng } = position) {
    return new mapIcons.Marker({
            position: new google.maps.LatLng(lat, lng),
            icon: {
                path,
                fillColor: '#FFCCBB',
                fillOpacity: 1,
                strokeColor: '',
                strokeWeight: 0
            },
            map_icon_label,
            map
        })
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
        strokeOpacity: 0.8,
        strokeWeight: 2,
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
    controlText.innerText = 'The map shows all clicks made in the last 10 minutes.'
    controlUI.appendChild(controlText)
}

// google map key: AIzaSyDqIKzgQx_yMB-fvxh4-_2YNRrXVDRUlyY