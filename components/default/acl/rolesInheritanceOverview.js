
Ext.define('Application.components.rolesInheritanceOverview', {
  extend: 'Ext.panel.Panel',
  initComponent: function() {
    var component = this;
    this.addEvents('inheritanceupdated');

    Ext.apply(this, {
      layout: 'border',
      items: [{
        region: 'center',
        layout: 'fit',
        xtype: 'Application.components.rolesInheritanceTree',
        listeners: {
          render: function() {
            this.relayEvents(component, ['inheritanceupdated']);
          }
        }
      }, {
        width: 400,
        split: true,
        layout: 'fit',
        region: 'east',
        xtype: 'Application.components.rolesGrid',
        enableDragDrop: true,
        editable: false,
        ddGroup: 'acl_roles',
        getDragDropText : function(){
          var record = this.selModel.getSelected();
          if (!record) {
            return '???';
          }
          return record.data.name;
        }
      }]
    });
    Application.components.rolesInheritanceOverview.superclass.initComponent.call(this);
  }
});
