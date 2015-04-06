Alloy.Globals.PW.locationCallback();

function getCurrentLocation(_callback){
	
}


function locationCallbackHandler(_location){
	
	//remove event handler since event was received
	Ti.Geolocation.removeEventListener('location', locationCallbackHandler);
	
	if(!_location.error && _location && _location.coords){
		
		var lat, lng;
		
		lat = _location.coords.latitude;
		lng = _location.coords.longitude;
		
		reverseGeocoder(lat, lng, function(_title){
			locationCallback({
				coords: _location.coords,
				title: _title
			}, null);
			locationCallback = null;
		});
	} else{
		alert('Location Services Error: ' + _location.error);
		_callback(null, _location.error);
	}
}

function reverseGeocoder(_lat, _lng, _callback){
	
	var title;
	
	Ti.Geolocation.purpose = "Wiley Alloy App Demo";
	
	//callback method converting lat lng into a location/address
	Ti.Geolocation.reversseGeocoder(_lat, _lng, function(_data){
		if (_data.sucess){
			Ti.API.debug("reverseGeo " + JSON.stringify(_data, null, 2));
			
			var place = _data.places[0];
			if(place.city === ""){
				title = place.address;
			} else{
				title = place.street + " " + place.city;
			}
		} else{
			title = "No Address Found: " + _lat + ", " + _lng;
		}
		
		_callback(title);
	});
}


exports.getCurrentLocation = function(_callback){
	if(!Ti.Geolocation.getLocationServicesEnabled()){
		alert('Location Services are not enabled');
		_callback(null, 'Location Services are not enabled');
		return;
	}
	
	//save in global for use in locationCallbackHandler
	
	locationCallback = _callback;
	
	Ti.Geolocation.purpose = "Wiley Alloy App Demo";
	Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
	Ti.Geolocation.distanceFilter = 10;
	Ti.Geolocation.addEventListener('location', locationCallbackHandler);
};
















































