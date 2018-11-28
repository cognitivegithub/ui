Application.Acl.Role = Ext.extend(Object, {
    constructor : function (name, baseRole) {
       this.name = name;           
       this.baseRole = baseRole;
    }
});