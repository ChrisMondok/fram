//HTMLElement.prototype.bindAttribute = function(name) {
//	var value = this[name];
//
//	Object.defineProperty(this, name, {
//		get: function() {
//			return value;
//		},
//		set: function(v) {
//			value = v;
//			this.setAttribute('data-'+name, value);
//		}
//	});
//
//};
