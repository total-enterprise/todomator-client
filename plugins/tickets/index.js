exports.icon = 'ti ti-check-circle';
exports.name = '@(Tickets)';
exports.permissions = [{ id: 'tickets', name: 'Tickets' }];
exports.position = 1;
exports.hidden = true;
exports.visible = user => user.sa || user.permissions.includes('tickets');
// exports.routes = [
	// { url: '/tickets/{id}/', html: 'detail' }
// ];

exports.install = function() {
	ROUTE('+API    /admin/    -tickets               --> Tickets/list');
	ROUTE('+API    /admin/    -tickets_read/{id}     --> Tickets/read');
	ROUTE('+API    /admin/    +tickets_create        --> Tickets/create');
};

NEWAPI('todomator', function(opt, next) {
	RESTBuilder.API(CONF.todomator, opt.schema, opt.data).callback(next);
});