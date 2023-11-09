exports.icon = 'ti ti-key';
exports.name = '@(Admin)';
exports.position = 100;
exports.visible = () => !CONF.op_reqtoken || !CONF.op_restoken;
exports.import = 'extensions.html';
exports.hidden = true;

exports.install = function() {
	ROUTE('+API    /admin/    -admin_read     --> Admin/read');
	ROUTE('+API    /admin/    +admin_save     --> Admin/save');
	ROUTE('+API    /admin/    -logout         --> Admin/logout');
	ROUTE('-API    /admin/    +login          --> Admin/login');
	ROUTE('-GET    /*', login);
};

FUNC.authadmin = function($) {

	if (BLOCKED($, 10)) {
		$.invalid();
		return;
	}

	var user = MAIN.db.user;
	var token = $.cookie(user.cookie);
	if (token) {
		var session = DECRYPTREQ($, token, user.salt);
		if (session && session.id === user.login && session.expire > NOW) {
			BLOCKED($, null);
			$.success({ id: user.id, name: user.name, sa: user.sa, permissions: user.permissions });
			return;
		}
	}

	$.invalid();
};

NEWSCHEMA('Admin', function(schema) {

	schema.action('read', {
		name: 'Read admin profile',
		action: function($) {
			var user = MAIN.db.user;
			var model = {};
			model.name = user.name;
			model.login = user.login;
			model.password = '';
			$.callback(model);
		}
	});

	schema.action('save', {
		name: 'Save admin profile',
		input: '*name,*login,password',
		action: function($, model) {

			var user = MAIN.db.user;
			user.login = model.login;

			if (model.password)
				user.password = model.password.sha256(user.salt);

			user.name = model.name;

			MAIN.db.user = user;
			MAIN.db.save();

			// Update session
			var session = {};
			session.id = user.login;
			session.expire = NOW.add('1 month');
			$.cookie(user.cookie, ENCRYPTREQ($, session, user.salt), session.expire);

			$.success();
		}
	});

	schema.action('login', {
		name: 'Login',
		input: '*login,*password',
		action: function($, model) {

			var user = MAIN.db.user;

			if (model.login !== user.login || model.password.sha256(user.salt) !== user.password) {
				$.invalid('@(Invalid credentials)');
				return;
			}

			if (user.raw) {
				delete user.raw;
				MAIN.db.user = user;
				MAIN.db.save();
			}

			var session = {};
			session.id = user.login;
			session.expire = NOW.add('1 month');
			$.cookie(user.cookie, ENCRYPTREQ($, session, user.salt), session.expire);
			$.success();
		}
	});

	schema.action('logout', {
		name: 'Logout',
		action: function($) {
			$.cookie(MAIN.db.user.cookie, '', '-1 day');
			$.success();
		}
	});

});

function login($) {
	$.view('#admin/login');
}

if (!MAIN.db.user) {
	(function() {
		var login = U.random_text(10);
		var password = U.random_text(10);
		var salt = U.random_text(10);
		var cookie = U.random_text(5);
		MAIN.db.user= { id: 'admin', name: 'John Connor', login: login, password: password.sha256(salt), raw: password, sa: true, cookie: cookie, salt: salt };
		MAIN.db.save();
	})();
}