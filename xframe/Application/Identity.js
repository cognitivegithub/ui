Application.Identity = Ext.extend(Ext.util.Observable, {
    loggedIn : false,
    data : { role : 'guest', login: null },
    constructor : function (config) {
    	Ext.apply(this, config);
    	Application.Identity.superclass.constructor.call(this, config);
    	this.sm = this.sessionManager;
    	this.setData({
    		role : this.sm.get('role', 'guest'),
    		login : this.sm.get('login', 'guest')
    	});
    	this.loggedIn = this.data.role != 'guest';
    	this.updateMenu();
    },
    setData : function (data) {
       Ext.apply(this.data, data);
       for (var p in this.data) {
         this.sm.set(p, this.data[p]);
       }
    },
    login : function (data) {
		this.clearSsw();
    	this.setData(Ext.apply(data, { role: 'user' }));
        this.loggedIn = true;
        this.updateMenu();
    },
    logout : function () {
		this.clearSsw();
    	this.setData({ role : 'guest', login: 'guest' });
        this.loggedIn = false;
        this.updateMenu();
    },
    getLogged : function () {
      return this.loggedIn;
    },
    setLogged : function (logged) {
      this.loggedIn = logged;
    },
    getRole : function () {
      return this.data.role;
    },
    updateMenu : function () {
      Main.layout.root.fireEvent('rolechanged', this.data, Application);
    	/*Ext.each(['login','logout'], function (li) {
    		var liEl = Ext.get(li);
    	    liEl.setVisibilityMode(Ext.Element.DISPLAY);
    	    if ((li=='login' && this.loggedIn) || (li=='logout' && !this.loggedIn)) liEl.hide(); else liEl.show();
    	}, this);*/
    },
  clearSsw: function () {
    if (typeof localStorage.ssw !== 'undefined') {
      var storage = JSON.parse(localStorage.ssw);
      for (var item in storage) {
        if (item === 'login_username') {
          continue;
        }
        this.sm.getProvider().set(item, '');
      }
    }
  }
});
