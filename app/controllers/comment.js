var parameters = arguments[0] || {};
var currentPhoto = parameters.photo || {};
var parentController = parameters.parentController ||{};
var comments = Alloy.Collections.instance("Comment");

OS_IOS && $.newComentButton.addEventListener("click", handleNewCommentButtonClicked);
OS_IOS && $.commentTable.addEventListener("delete", handleDeleteRow);
OS_ANDROID && $.commentTable.addEventListener("longpress", handleDeleteRow);

$.commentTable.editable = true;



function deleteComment(_comment) {
	_comment.destroy({
		data : {
			photo_id : currentPhoto.id, 
			id : _comment.id 
		},
		success : function(_model, _response) {
			loadComments(null);
		},
		error : function(_e) {
			Ti.API.error('error: ' + _e.message);
			alert("Error deleteing comment");
			loadComments(null);
		}
	});
}

function handleDeleteRow(_event) {
	var collection = Alloy.Collections.instance("Comment");
	var model = collection.get(_event.row.comment_id);

	if (!model) {
		alert("Could not find selected comment");
		return;
	} else {

		if (OS_ANDROID) {
			var optionAlert = Titanium.UI.createAlertDialog({
				title : 'Alert',
				message : 'Are You Sure You Want to Delete the Comment',
				buttonNames : ['Yes', 'No']
			});

			optionAlert.addEventListener('click', function(e) {
				if (e.index == 0) {
					deleteComment(model);
				}
			});
			optionAlert.show();
		} else {
			deleteComment(model);
		}
	}
}


function loadComments(_photo_id) {

	var params = {
		photo_id : currentPhoto.id,
		order : '-created_at',
		per_page : 100
	};
	
	var rows = [];	

	comments.fetch({
		data : params,
		success : function(model, response) {
			comments.each(function(comment) {
				var commentRow = Alloy.createController("commentRow", comment);
				rows.push(commentRow.getView());
			});
			// set the table rows
			$.commentTable.data = rows;
		},
		error : function(error) {
			alert('Error loading comments ' + e.message);
			Ti.API.error(JSON.stringify(error));
		}
	});
}

function doOpen()
{
	if(OS_ANDROID)
	{
		var activity = $.getView().activity;
		var actionBar = activity.actionBar;
		
		activity.onCreateOptionsMenu = function(_event){
			if(actionBar)
			{
				actionBar.displayHomeAsUp = true;
				actionBar.onHomeIconSelected = function(){
					$.getView().close();
				};
			}
			else{
				alert("No Action Bar Found");
			}
		};
		
		var menuItem = _event.menu.add(
			{
				title: "New Comment",
				showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon: Ti.Android.R.drawable.ic_menu_edit
			}
		);
		
		menuItem.addEventListener("click", function(e){
			handleNewCommentButtonClicked();
		});
	}
}

on inputCallback(_event) {
	if (_event.success) {
		addComment(_event.content);
	} else {
		alert("No Comment Added");
	}
}



function handleNewCommentButtonClicked(_event) {
	var navWin;
	
	var inputController = Alloy.createController("commentInput", {
		photo : currentPhoto,
		parentController : $,
		callback : function(_event) {
			inputController.getView().close();
			inputCallback(_event);
		}
	});

	inputController.getView().open();
}


function addComment(_content) {
	var comment = Alloy.createModel('Comment');
	var params = {
		photo_id : currentPhoto.id,
		content : _content,
		allow_duplicate : 1
	};

	comment.save(params, {
		success : function(_model, _response) {
			Ti.API.debug('success: ' + _model.toJSON());
			var row = Alloy.createController("commentRow", _model);

			// add the controller view, which is a row to the table
			if ($.commentTable.getData().length === 0) {
				$.commentTable.setData([]);
				$.commentTable.appendRow(row.getView(), true);
			} else {
				$.commentTable.insertRowBefore(0, row.getView(), true);
			}

			notifyFollowers(_model, currentPhoto, "New comment posted by");
		},
		error : function(e) {
			Ti.API.error('error: ' + e.message);
			alert('Error saving new comment ' + e.message);
		}
	});
};

$.initialize = function()
{
	loadComments();
};




