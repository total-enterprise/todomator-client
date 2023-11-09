var db = MAIN.db = MEMORIZE('data');

// Fixed settings
CONF.$customtitles = true;

// UI components
COMPONENTATOR('ui', 'exec,locale,aselected,page,viewbox,input,importer,box,validate,loading,selected,intranetcss,notify,message,errorhandler,empty,menu,ready,colorpicker,approve,icons,directory,miniform,tangular-filesize,searchinput,filereader,wysiwyg,iframeeditable,iframepreview', true);

// Permissions
ON('ready', function() {
	for (var key in F.plugins) {
		var item = F.plugins[key];
		if (item.permissions)
			OpenPlatform.permissions.push.apply(OpenPlatform.permissions, item.permissions);
	}
});