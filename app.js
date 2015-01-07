var TaskProto = Object.create(fram.baseWidget);

TaskProto.createdCallback = function() {
	fram.baseWidget.createdCallback.apply(this, arguments);

	var input = this._shadow.querySelector('input');

	window.input = input;

	input.bindTo(this, 'done');

	this.bindAttribute('done');
};

fram.bindAttribute(TaskProto, 'done');

fram.observeProperty(TaskProto, 'name', function(name) {
	console.log("Renamed task to "+name);
});

fram.defineWidget('task-item', 'task.html', TaskProto);
