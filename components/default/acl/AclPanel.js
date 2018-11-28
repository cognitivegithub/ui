/**
 * Панель для управления ролями, ресурсами и привилегиями
 *
 * Параметры:
 *   нету
 *
 * Евенты:
 *   нету
 */
Ext.define('Application.components.AclPanel', {
  extend: 'Ext.tab.Panel',
  initComponent: function() {
    var roles_grid_id = Ext.id();
    var child_roles_id = Ext.id();
    var parent_roles_id = Ext.id();

    var onShow = function() {
      this.relayEvents(Ext.getCmp(roles_grid_id), ['roleselected'])
    };
    Ext.apply(this, {
      //height: 500,
      defaults: {
        border: false,
        autoHeight: false,
        defaults: {
          autoHeight: false,
          border: false
        }
      },
      activeTab: 0,
      border: false,
      items: [{
        title: 'Роли и права',
        layout: 'border',
        items: [
          {
            width: 500,
            region: 'west',
            layout: 'fit',
            id: roles_grid_id,
            split: true,
            lean: true,
            hideActions: true,
            autoHeight: false,
            title: 'Список ролей',
            xtype: 'Application.components.rolesGrid'
          },
          {
            xtype: 'tabpanel',
            region: 'center',
            defaults: {
              autoHeight: false
            },
            activeTab: 0,
            items: [{
              type: 'gui',
              xtype: 'Application.components.aclAccessGrid',
              listeners: {
                added: onShow
              }
            }, {
              type: 'api',
              xtype: 'Application.components.aclAccessGrid',
              listeners: {
                added: onShow
              }
            },
              {
                type: 'menu',
                xtype: 'Application.components.aclAccessGrid',
                listeners: {
                  added: onShow
                }
              },
              {
              xtype: 'Application.components.rolesInheritance',
              title: 'Дочерние роли',
              type: 'child',
              id: child_roles_id,
              listeners: {
                added: onShow
              }
            }, {
              xtype: 'Application.components.rolesInheritance',
              title: 'Родительские роли',
              type: 'parent',
              id: parent_roles_id,
              listeners: {
                added: onShow
              }
            }]
          }
        ]
      }, {
        type: 'gui',
        xtype: 'Application.components.resourcesGrid'
      }, {
        type: 'api',
        xtype: 'Application.components.resourcesGrid'
      }, {
        xtype: 'Application.components.menuGrid'
      }, {
        title: 'Иерархия ролей',
        xtype: 'Application.components.rolesInheritanceOverview',
        listeners: {
          added: function() {
            this.relayEvents(Ext.getCmp(child_roles_id), ['inheritanceupdated']);
            this.relayEvents(Ext.getCmp(parent_roles_id), ['inheritanceupdated']);
          }
        }
      }]
    });
    Application.components.AclPanel.superclass.initComponent.call(this);
  }
});
