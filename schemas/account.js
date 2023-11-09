NEWACTION('account', {
	name: 'Read account data',
	action: function($) {
		$.callback($.user.json ? $.user.json() : $.user);
	}
});