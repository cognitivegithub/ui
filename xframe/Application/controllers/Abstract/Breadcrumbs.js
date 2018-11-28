Application.controllers.Abstract.Breadcrumbs = Ext.extend(Object, {
    constructor : function (config) {
        Ext.apply(this, config);
        this.data = [];
        this.ct = Ext.query('.companies_nav')[0];
        var lastEls = Ext.query('.companies_nav a');
        this.lastEl = lastEls[lastEls.length-1];
	},
    clear : function () {
        Ext.each(this.data, function (n) {
           this.ct.removeChild(n.el);
           this.ct.removeChild(n.textEl);
        }, this);
        this.data.length = 0;
        Ext.get(this.lastEl).addClass('active');
    },
    add : function (step) {
        if (this.data.length == 0) Ext.get(this.lastEl).removeClass('active');
        if (step.url && step.title) {
           var newStep = {};
           Ext.apply(newStep, step);
           newStep.textEl = document.createTextNode(' > ');
           newStep.el = Ext.DomHelper.createDom({
                tag: 'a',
                cls : 'active',
                html: newStep.title,
                href: '#' + step.url
           });
        }
        Ext.each(this.data, function (n) {
           Ext.get(n.el).removeClass('active');               
        });
        this.ct.appendChild(newStep.textEl);
        this.ct.appendChild(newStep.el);
        this.data.push(newStep);
    }
});