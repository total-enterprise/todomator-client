var Hostname = '';

(function() {
	var url = F.Url.parse(CONF.todomator);
	Hostname = url.protocol + '//' + url.host;
})();

NEWACTION('Tickets/list', {
	name: 'List of tickets',
	permissions: 'tickets',
	query: 'search',
	action: async function($) {

		$.query.limit = 50;
		$.query.type = 'all';
		$.query.folderid = CONF.todomator_folder;

		var response = await API('todomator', QUERIFY('tickets', $.query)).promise($);
		for (var m of response)
			m.worked = undefined;

		$.callback(response);
	}
});

NEWACTION('Tickets/read', {
	name: 'Read a ticket',
	permissions: 'tickets',
	params: 'id',
	action: async function($) {
		var params = $.params;
		var response = await API('todomator', 'tickets_detail/{id}'.args(params)).error(404).promise($);

		if (CONF.todomator_folder === response.folderid) {

			if (response.attachments && response.attachments.length) {
				for (let i of response.attachments) {
					var url = i.url;
					i.url = Hostname + url;
				}
			}

			// response.markdown = response.markdown.replace('/download', Hostname + '/download');

			response.userid = undefined;
			response.worked = undefined;
			response.markdown = undefined;

			$.callback(response);
		} else
			$.invalid(404);
	}
});

NEWACTION('Tickets/create', {
	name: 'Create ticket',
	permissions: 'tickets',
	input: '*name, ispriority:Boolean, html, markdown, reference, date:Date, deadline:Date, attachments:[*name:String, *data:*Base64]',
	action: function($, model) {

		model.source = CONF.name;
		model.folderid = CONF.todomator_folder;
		model.users = CONF.todomator_users;

		API('todomator', 'tickets_create', model).error(404).callback($);
	}
});
