(function() {
	var proto = Object.create(HTMLInputElement.prototype);

	proto.bindTo = function(scope, property) {
		fram.observeProperty(scope, property, function(value) {
			if(this.type == "checkbox")
				this.setAttribute("checked", value);
			else
				this.setAttribute("value", value);
		}.bind(this));

		this.addEventListener('change', function() {
			if(this.type == "checkbox")
				scope[property] = this.checked;
			else
				scope[property] = this.value;
		});
	};

	window.DataBound = document.registerElement('data-bound', {
		"extends": "input",
		prototype: proto
	});
})();

