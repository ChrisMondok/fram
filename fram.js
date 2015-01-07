(function Fram() {
	var baseWidget = Object.create(HTMLElement.prototype);

	window.fram = {
		defineWidget: defineWidget,
		baseWidget: baseWidget,
		observeProperty: observeProperty,
		bindAttribute: function(scope, name) {
			baseWidget.bindAttribute.call(scope, name);
		}
	};

	function defineWidget(name, templateUrl, widgetPrototype) {
		var callback = undefined;

		var proto = widgetPrototype || Object.create(baseWidget);

		loadTemplateIfNeeded(templateUrl, function(template) {
			widgetPrototype._template = document.importNode(template, true);
			var element = document.registerElement(name, {prototype: proto});
			if(callback)
				callback(element);
		});

		return function(cb) {
			callback = cb;
		};
	}

	function loadTemplateIfNeeded(url, callback) {
		if(url) {
			var req = new XMLHttpRequest();

			req.open('GET', url);
			req.responseType = 'document';
			req.addEventListener('load', function(event) {
				var templates = req.response.getElementsByTagName('template');
				if(templates.length != 1)
					throw new Error(url + " MUST define exactly one template!");

				callback(templates[0]);
			});
			req.send();
		}
		else
			setTimeout(callback);
	}

	baseWidget.createdCallback = function() {
		if(this._template) {
			this._shadow = this.createShadowRoot();
			this._shadow.appendChild(this._template.content);
		}
	};

	baseWidget.bindAttribute = function(name) {
		var normalized = name.replace(/^data-/,"");

		this._boundAttributes = this._boundAttributes || [];
		this._boundAttributes.push(normalized);

		fram.observeProperty(this, name, function(newName) {
			this.setAttribute('data-'+normalized, JSON.stringify(newName));
		}.bind(this));
	};

	baseWidget.attributeChangedCallback = function(name, oldValue, newValue) {
		var normalized = name.replace(/^data-/,"");

		if(this._boundAttributes && this._boundAttributes.indexOf(normalized) != -1) {
			var parsed = newValue && JSON.parse(newValue);
			this[normalized] = parsed;
		}
	};

	baseWidget.observeProperty = function(propertyName, callback) {
		fram.observeProperty(this, propertyName, callback);
	};

	function observeProperty(scope, propertyName, callback) {
		var existingDescriptor = Object.getOwnPropertyDescriptor(scope, propertyName);

		var getter = undefined;
		var setter = undefined;
		var valueForIfThereIsNoSetter = undefined;

		if(existingDescriptor) {
			if(!existingDescriptor.configurable)
				throw new Error("Can't observe a non-configurable property");

			if(existingDescriptor.writable === false)
				throw new Error("Can't observe a non-writable property");

			getter = existingDescriptor.get;
			setter = existingDescriptor.set;

			if(getter && !setter)
				throw new Error("Can't observe a read-only property");

			valueForIfThereIsNoSetter = existingDescriptor.valueForIfThereIsNoSetter || scope.valueForIfThereIsNoSetter;
		}

		var descriptor = { configurable: true };

		if(setter) {
			descriptor.get = getter;
			descriptor.set = function(v) {
				var old;
				if(getter)
					old = getter();
				setter(v);
				if(!getter || v !== old)
					callback.call(this, v, old);
				return v;
			};
		}
		else {
			descriptor.get = function() {
				return valueForIfThereIsNoSetter;
			};
			descriptor.set = function(v) {
				var old = valueForIfThereIsNoSetter;
				valueForIfThereIsNoSetter = v;
				if(old !== valueForIfThereIsNoSetter)
					callback.call(this, v, old);
				return v;
			};
		}

		Object.defineProperty(scope, propertyName, descriptor);
	}
})();
