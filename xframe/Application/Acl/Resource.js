Application.Acl.Resource = Ext.extend(Object, {
   constructor : function (name, config) {
      this.name = name;
      if(config) Ext.apply(this, config);
   }
});