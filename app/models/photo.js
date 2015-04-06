exports.definition = {
	config: {

		adapter: {
			type: "acs",
			collection_name: "photos"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
			findMyPhotosAndWhoIFollow: function(_user, _options){
				var collections = this;
			
				//get all of the current user's friends
				_user.getFriends(function(_resp) {
					if (_resp.success){
						
						//pluck the user ids and add current user's id
						var idList = _.pluck(_resp.collection.models, "id");
						idList.push(_user.id);
						
						//set up where parameters using the user list
						var where_params = {
							"user_id": {
								"$in": idList
							},
							title: {
								"$exists": true
							}
						};
						
						//set the where params on the query
						_options.data = _options.data || {};
						_options.data.order = '-created_at';
						_options.data.per_page = 25;
						_options.data.where = JSON.stringify(where_params);
						
						//execute the query
						collection.fetch(_options);
					} else{
						Ti.API.error('Error fetching friends');
						_options.error();
					}
				});
			},
		});

		return Collection;
		},
		
		
findPhotosNearMe :function(_user, _location, _distance, _options){
		var collection = this;
		
		//convert distance to radians if provided
		var distance = _distance ? (_distance /3959) : 0.00126;
		
		if(_location === null){
			_options.error("Could not find photos");
			return;
		}
		//get all current user's friends
		_user.getFriends(function(_resp){
			if (_resp.success){ //debugger;
				
				var idList = _.pluck(_resp.collection.models, "id");
				idList.push(_user.id);
				
				//first we get the current location
				var coords = [];
				coords.push(_location.coords.longitutde);
				
				coords.push(_location.coords.latitude);
				
				//set up where parameters
				var where_params = {
					"user_id": {
						"$in": idList
					},
					
					"coordinates":{
						"$nearSphere": coords,
						"$maxDistance": distance //5 miles in
						//radians
					}
				};
				
				//set the where params on query
				_options.data = _options.data || {};
				_options.data.per_page = 25;
				_options.data.where = JSON.stringify(where_params);
				
				//execute query
				collection.fetch(_options);
				}
				else{
					_options.error("Could not find photos");
					return;
				}
		});
		
			
		}
	
};








































