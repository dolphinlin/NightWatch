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
        addToFirebase2(data);
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
    // dangerPin(map, dangers, )
    // initAuthentication(initFirebase.bind(undefined, heatmap));
}

function testMap(map) {
    var locRef = firebase.database().ref('location/');

    let markers = new Map()
    locRef.on('child_added', function (data) {
        console.log(data.key)
        var marker = new mapIcons.Marker({
            position: new google.maps.LatLng(data.val().loc.lat, data.val().loc.lng),
            icon: {
                path: mapIcons.shapes.SQUARE_PIN,
                fillColor: '#00CCBB',
                fillOpacity: 1,
                strokeColor: '',
                strokeWeight: 0
            },
            map_icon_label: `<span class="map-icon ${data.val().gender ? 'map-icon-male' : 'map-icon-female'}"></span>`,
            map
        });
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
            infowindow.open(map, marker);
            locRef.child(data.key).update({
                loc: {
                    lat: data.val().loc.lat + 0.001,
                    lng: data.val().loc.lng + 0.001
                }
            }).then(res => {
                console.log('update success')
            })
            console.log(this)
        });

        marker.addListener('dblclick', function () {
            locRef.child(data.key).remove()
        });

        markers.set(data.key, marker)
    });

    locRef.on('child_changed', function (data) {
        let m = markers.get(data.key)
        m.setMap(null)
        // m.map_icon_label = '<span class="map-icon map-icon-grocery-or-supermarket"></span>'
        var marker = new mapIcons.Marker({
            position: new google.maps.LatLng(data.val().loc.lat, data.val().loc.lng),
            icon: {
                path: mapIcons.shapes.SQUARE_PIN,
                fillColor: '#FFCCBB',
                fillOpacity: 1,
                strokeColor: '',
                strokeWeight: 0
            },
            map_icon_label: `<span class="map-icon ${data.val().gender ? 'map-icon-male' : 'map-icon-female'}"></span>`,
            map
        });
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

// userID/userName/userPhone/userPhoto/UserSex/userLocation{log/lat}

function addToFirebase2({ name, gender, photo, loc, phone } = data) {
    firebase.database().ref('location/').push({
        name,
        gender,
        photo,
        loc,
        phone
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

/**
 * Set up a Firebase with deletion on clicks older than expirySeconds
 * @param {!google.maps.visualization.HeatmapLayer} heatmap The heatmap to
 * which points are added from Firebase.
 */
function initFirebase(heatmap) {

    // Reference to the clicks in Firebase.
    var loc = firebase.database().ref('location/');

    // Listener for when a click is added.
    loc.on('child_added', function (snapshot) {



        // Get that click from firebase.
        var newPosition = snapshot.val();

        console.log(`get new location ${newPosition}`)
        var point = new google.maps.LatLng(newPosition.lat, newPosition.lng);
        var elapsed = new Date().getTime() - newPosition.timestamp;

        // Add the point to  the heatmap.
        heatmap.getData().push(point);

        // Requests entries older than expiry time (10 minutes).
        var expirySeconds = Math.max(60 * 10 * 1000 - elapsed, 0);
        // Set client timeout to remove the point after a certain time.
        window.setTimeout(function () {
            // Delete the old point from the database.
            snapshot.ref().remove();
        }, expirySeconds);
    }
    );

    // Remove old data from the heatmap when a point is removed from firebase.
    loc.on('child_removed', function (snapshot, prevChildKey) {
        var heatmapData = heatmap.getData();
        var i = 0;
        while (snapshot.val().lat != heatmapData.getAt(i).lat()
            || snapshot.val().lng != heatmapData.getAt(i).lng()) {
            i++;
        }
        heatmapData.removeAt(i);
    });
}

// google map key: AIzaSyDqIKzgQx_yMB-fvxh4-_2YNRrXVDRUlyY