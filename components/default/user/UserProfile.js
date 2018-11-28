Ext.define('Application.components.UserProfile', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    
    var uTpl = getUserdataTemplate();
    
    var panel_items = [{
          xtype: 'fieldset',
          tpl: uTpl,
          title: 'Основные данные',
          data: component.cmpdata
        }];

    if (component.cmpdata['company[id]']) {
      var companyTpl = getCompanydataTemplate();
      panel_items.push({
          xtype: 'fieldset',
          tpl: companyTpl,
          title: 'Данные об организации',
          data: component.cmpdata.company_data_short,
          hidden: Main.config.veb_custom
        });
      panel_items.push({
          xtype: 'Application.components.filelistPanel',
          title: 'Документы пользователя',
          withHash: false,
          listeners: {
            beforerender: function() {
              this.setValues(component.cmpdata.user_files_list);
            }
          },
          hidden: Main.config.veb_custom
        });
    }

    Ext.apply(this,
      {
        xtype: 'panel',
        border: false,
        frame: true,
        layout : 'form',
        title: 'Информация о пользователе',
        bodyCssClass: 'subpanel-top-padding',
        items: panel_items,
        listeners: {
          beforerender : function() {
            if (!component.cmp_params.id || component.cmp_params.id == Main.user.id) {
              component.addButton(createSimpleRedirectButton('Редактировать','user/edit'));

              if (Main.user.user_has_valid_for) {
                component.addButton(createSimpleRedirectButton('Подать заявку на перерегистрацию','user/accred'));
              }
            }
            if (component.cmp_params.act == 'editFr') {
              component.addButton(createSimpleRedirectButton(
                'Редактировать',
                'user/edit/id/' + component.cmp_params.id + (component.cmp_params.act == 'editFr'  ? '/act/' + component.cmp_params.act : "")
              ));
            }
          }
        }
    });
    Application.components.UserProfile.superclass.initComponent.call(this);
  }
});
