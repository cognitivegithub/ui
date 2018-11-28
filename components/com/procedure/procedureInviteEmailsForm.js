
Ext.define('Application.components.procedureInviteEmailsForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    var empty_text_id = Ext.id(),
        emails_list_id = Ext.id(),
        field_email_id = Ext.id();

    this.emails_added = {};

    this.addEvents('dataload');

    Ext.apply(this,
     {
      labelWidth: 150,
      frame: true,
      autoScroll: true,
      title: 'Формирование перечня e-mail адресов для рассылки приглашений',
      fileUpload: true,
      items : [
        {
          xtype: 'Application.components.procedureViewPanel',
          procedure_id: component.procedure_id,
          procedureAutoLoad : true,
          autoHeight: true,
          frame: false,
          border: false,
          style: 'padding-bottom: 5px',
          listeners: {
            'dataload'  : function(procedure) {
              if (procedure.invite_emails) {
                var invite_emails = procedure.invite_emails.split(';');
                for(var i=0; i<invite_emails.length; i++) {
                  component.addEmail(invite_emails[i]);
                }
              }
            }
          }
        }, {
          xtype: 'fieldset',
          title: 'Формирование перечня e-mail адресов для рассылки приглашений',
          style: 'margin: 5px;',
          items : [
            {
              xtype: 'hidden',
              name: 'procedure_id',
              value: component.procedure_id
            }, {
              xtype: 'fieldset',
              border: false,
              style: 'padding-bottom: 0px;',
              items: [{
                xtype: 'textfield',
                anchor: '100%',
                id: field_email_id,
                name: 'email',
                vtype: 'email',
                fieldLabel: 'E-mail'
              }],
              buttons: [{
                text: 'Добавить в список',
                handler: function() {
                  var field_email = Ext.getCmp(field_email_id);
                  component.addEmail(field_email.getValue());
                }
              }]
            }, {
              xtype: 'panel',
              title: 'Список выбранных адресов',
              border: true,
              frame: true,
              bodyStyle: 'padding: 10px;',
              id: emails_list_id,
              items: [{
                id: empty_text_id,
                html: 'Список пуст'
              }]
            }
          ],
          buttons: [{
            text: 'Удалить выбранных',
            handler: function() {
              var emails_list = component.getEmailsList();
              emails_list.items.each(function(item) {
                if (item.value && item.checked) {
                  emails_list.remove(item);
                  delete component.emails_added[item.value];
                }
              });
              component.emptyTextShow();
              component.doLayout();
            }
          }]
        }
      ],
      buttons: [{
        text: 'Сохранить',
        scope: this,
        formBind : true,
        handler: function() {
          var parameters = component.getValues();

          var emails = [];
          for(var pp in component.emails_added) {
            emails.push(component.emails_added[pp]);
          }
          parameters.emails = emails;

          performRPCCall(RPC.Procedure.invitemailssave, [parameters], {wait_text: 'Сохраняем адреса для рассылки'}, function(result) {
            if(result.success) {
              Ext.Msg.alert('Успешно', 'Перечень адресов для рассылки сохранен', function() {redirect_to('com/procedure/index');});
            } else {
              echoResponseMessage(result);
            }
          });
        }
      }, {
        text: 'Закрыть',
        handler: function() {
          redirect_to('com/procedure/index');
        }
      }],
      getValues : function() {
        var values = {};
        collectComponentValues(this, values, false);
        return values;
      },
      emptyTextShow: function() {
        var emails_list = component.getEmailsList();
        var empty_text = Ext.getCmp(empty_text_id);
        if (emails_list.items.length == 1) {
          empty_text.setVisible(true);
        } else {
          empty_text.setVisible(false);
        }
      },
      getEmailsList: function() {
        if (!this.emails_list) {
          this.emails_list = Ext.getCmp(emails_list_id);
        }
        return this.emails_list;
      },
      addEmail: function(email) {
        if (component.emails_added[email]) {
          Ext.Msg.alert('Ошибка', 'Такой адрес уже указан');
          return;
        }
        var emails_list = component.getEmailsList();
        emails_list.add({
          xtype: 'checkbox',
          hideFieldLabel: true,
          boxLabel: email,
          value: email
        });
        component.emails_added[email] = email;
        var field_email = Ext.getCmp(field_email_id);
        field_email.setValue('');
        component.emptyTextShow();
        component.doLayout();
      }
    });
    Application.components.procedureInviteEmailsForm.superclass.initComponent.call(this);
  }
});
