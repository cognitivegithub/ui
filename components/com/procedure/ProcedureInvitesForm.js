
Ext.define('Application.components.ProcedureInvitesForm', {
  extend: 'Ext.form.Panel',
  frame: true,
  autoHeight: true,
  initComponent: function() {
    var component = this;
    this.addEvents('load_invite_text');
    var categories_panel_id = Ext.id();
    var invite_subject_id = Ext.id();
    var invite_body_id = Ext.id();
    var procedure_selection_grid_id = Ext.id();

    Ext.apply(this, {
      labelWidth: 150,
      defaults: {
        anchor: '100%'
      },
      bodyCssClass: 'subpanel-top-padding',
      items: [
        {
          xtype: 'fieldset',
          title: 'Процедуры',
          items: [{
            xtype: 'Application.components.ProcedureSelectionGrid',
            id: procedure_selection_grid_id,
            procedure_id: component.procedure_id
          }]
        }, {
          xtype: 'fieldset',
          title: 'Содержимое приглашения',
          defaults: {
            anchor: '100%'
          },
          items: [
            {
              xtype: 'textfield',
              fieldLabel: 'Тема приглашения',
              id: invite_subject_id,
              name: 'subject'
            }, {
              xtype: 'textarea',
              fieldLabel: 'Текст приглашения',
              id: invite_body_id,
              height: 200,
              name: 'message_text'
            }
          ]
        }, {
          xtype: 'fieldset',
          title: 'Сферы деятельности заявителей',
          items: [
            {
              xtype: 'Application.components.CompanyCategoriesPanel',
              optype: 'choice',
              id: categories_panel_id
            }
          ]
        }
      ],
      buttons: [{
        text: 'Отправить приглашения',
        handler: function() {
          var subject_field = Ext.getCmp(invite_subject_id);
          var body_field = Ext.getCmp(invite_body_id);
          if (!subject_field.getValue()) {
            Ext.Msg.alert('Ошибка', 'Не указана тема приглашения');
            return;
          }
          if (!body_field.getValue()) {
            Ext.Msg.alert('Ошибка', 'Не указан текст приглашения');
            return;
          }
          var params = [];
          params = component.getForm().getValues();
          var cpanel = Ext.getCmp(categories_panel_id);
          params.categories = cpanel.getCategories();
          if (params.categories.length == 0) {
            Ext.Msg.alert('Ошибка', 'Не выбраны сферы деятельности');
            return;
          }
          performRPCCall(RPC.Procedure.sendInvites, [params], {wait_text: 'Отправка приглашений...'}, function(response) {
            if (response.success) {
              Ext.Msg.alert('Информация', 'Отправлено приглашений: ' + response.invites);
            } else {
              Ext.Msg.alert('Ошибка', response.message);
            }
          });
        }
      }, {
        text: 'Отмена',
        handler: function() {
          history.back(1);
        }
      }],
      listeners: {
        beforerender: function() {
          component.relayEvents(Ext.getCmp(procedure_selection_grid_id), ['load_invite_text']);        
        },
        load_invite_text: function() {
          var procedure_selection_grid = Ext.getCmp(procedure_selection_grid_id);
          var selected = procedure_selection_grid.getSelectionModel().getSelections();
          var params = [];
          for (var i=0; i<selected.length; i++) {
            params.push(selected[i].id);
          }
          var subject_field = Ext.getCmp(invite_subject_id);
          var body_field = Ext.getCmp(invite_body_id);
          if (params.length > 0) {
            performRPCCall(RPC.Procedure.loadInvitesText, [params], {wait_text: 'Загружается шаблон приглашения...'}, function(response) {
              if (response.success) {
                subject_field.setValue(response.invite_text.subject);
                body_field.setValue(response.invite_text.body);
              } else {
                Ext.Msg.alert('Ошибка', response.message);
              }
            });
          } else {
            subject_field.setValue('');
            body_field.setValue('');
          }
        }
      }
    });
    Application.components.ProcedureInvitesForm.superclass.initComponent.call(this);
  }
});
