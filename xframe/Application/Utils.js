Application.Utils = {
    arraySearch : function (array, fn, scope) {
	    var itm = null;
	    Ext.each(array, function (item, index, allItems) {
	        if (fn.createDelegate(this, [item, index, allItems]).call()) {
	            itm = item;
	        }
	    }, scope);
	    return itm;
	}
};