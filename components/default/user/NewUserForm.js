
Application.components.NewUserForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  fileUpload: true,
  initComponent : function () {
    this.addEvents('doRegister');
    var component = this;
    var action = (component.act)?component.act : 'register';
    this.ids = {
      company_id: Ext.id(),
      contragent_full_name: Ext.id(),
      reg_button: Ext.id(),
      inn: Ext.id(),
      kpp: Ext.id(),
      login_username: Ext.id(),
      last_name: Ext.id(),
      first_name: Ext.id(),
      middle_name: Ext.id(),
      user_job: Ext.id(),
      user_email: Ext.id(),
      user_external_email: Ext.id(),
      capanel: Ext.id()
    };

    var innSelect = function() {
      var inn = Ext.getCmp(component.ids.inn).getValue();
      if ((validateINN(inn) && Main.config.validate_company_inn) || !Main.config.validate_company_inn) {
        var cmpStore = getContragentStoreByInn(inn);
        cmpStore.load({params: {inn: inn}});

        var cmpWindowId = Ext.id();
        var cmplist_id = Ext.id();
        var cmpWindow = new Ext.Window({
          width: 550,
          closeAction: 'close',
          frame: true,
          title: 'Выбор организации',
          modal: true,
          id: cmpWindowId,
          items: [
          {
            layout: 'table',
            frame: true,
            border: false,
            layoutConfig: {
              columns: 2
            },
            items: [
            {
              xtype: 'combo',
              id: cmplist_id,
              valueField: 'rowid',
              displayField: 'display_field',
              fieldLabel: '',
              hideLabel: true,
              store: cmpStore,
              mode: 'local',
              typeAhead: true,
              width: 450,
              forceSelection: true,
              triggerAction: 'all',
              emptyText: 'Выберите...',
              selectOnFocus: false
            },
            {
              xtype: 'button',
              text: 'Выбрать',
              handler: function() {
                var selected_id = Ext.getCmp(cmplist_id).getValue();
                var recordIndex = cmpStore.find('rowid', selected_id);
                var item = cmpStore.getAt(recordIndex);

                if ( item ) {
                  var kpp ='';
                  var full_name=''
                  if (item.data.kpp && item.data.kpp!=null && item.data.kpp!='') {
                    kpp=item.data.kpp;
                  }
                  if(selected_id!=0) {
                    full_name=item.data.full_name;
                  }
                  if(kpp!='') {
                    Ext.getCmp(component.ids.kpp).setValue(kpp);
                  }
                  if(full_name!='') {
                    Ext.getCmp(component.ids.contragent_full_name).setValue(full_name);
                  }
                  //old_inn = Ext.getCmp('inn').setValue();
                } else {
                  Ext.MessageBox.alert('Ошибка!', 'Необходимо указать организацию');
                }

              Ext.getCmp(component.ids.company_id).setValue(selected_id);
              Ext.getCmp(cmpWindowId).close();
              }
            }]
          }]
        });
        cmpWindow.show();
        Ext.getCmp(component.ids.reg_button).setDisabled(false);
      } else {
        Ext.MessageBox.alert('Ошибка', 'Указан некорректный ИНН');
        Ext.getCmp(component.ids.reg_button).setDisabled(true);
      }
    }

    var generateLogin = function() {
      var login = Ext.getCmp(component.ids.login_username);
      var last_name = Ext.getCmp(component.ids.last_name).getValue();
      var first_name = Ext.getCmp(component.ids.first_name).getValue();
      var middle_name = Ext.getCmp(component.ids.middle_name).getValue();
      var name = '';
      if (''!=last_name) {
        name = last_name;
      }
      if (''!=first_name) {
        name += '-'+first_name.charAt(0);
      }
      if (''!=middle_name) {
        name += middle_name.charAt(0);
      }
      login.setValue(name);
    }

    Ext.apply(this, {
      autoHeight: true,
      width: 650,
      layout : 'form',
      title: component.title,
      labelWidth: 200,
      frame: true,
      defaults: {
        anchor: '100%',
        stateful: true,
        autoHeight: true,
        allowBlank: false,
        xtype: 'fieldset',
        layout: 'form',
        stateEvents: ['change'],
        getState: function() {
          return {
            value: this.getValue()
          };
        },
        defaults: {
          anchor: '100%',
          msgTarget: 'under',
          allowBlank: false
        }
      },
      monitorValid : true,
      bodyCssClass: 'subpanel',
      items : [
      {
        title: 'Данные об организации',
        xtype: 'fieldset',
        items: [
        {
          xtype: 'hidden',
          name: 'company_id',
          id: component.ids.company_id
        },
        {
          frame: false,
          border: false,
          layout: 'form',
          labelAlign: 'top',
          items: [
          {
            xtype: 'textfield',
            name: 'full_name',
            anchor: '100%',
            id: component.ids.contragent_full_name,
            fieldLabel: 'Полное наименование организации (Ф.И.О. в случае аккредитации физического лица)'+REQUIRED_FIELD,
            minLength: 3,
            maxLength: 1000,
            allowBlank: false
          }]
        },
        {
          xtype: 'textfield',
          name: 'inn',
          id: component.ids.inn,
          vtype: (Main.config.validate_company_inn ? 'inn' : null),
          minLength: 10,
          maxLength: 12,
          fieldLabel: 'ИНН'+REQUIRED_FIELD,
          emptyText: '10 - 12 цифр',
          listeners: {
            blur: innSelect
          }
        },
        {
          xtype: 'textfield',
          name: 'kpp',
          vtype: 'digits',
          minLength: 9,
          maxLength: 9,
          emptyText: '9 цифр',
          id: component.ids.kpp,
          fieldLabel: 'КПП',
          allowBlank: true
        }
        ],
        buttons: [{
          text: 'Заполнить из ЭП',
          handler: function() {
            var eds = signData('-', true);
            if (!checkSignatureResult(eds)) {
              return;
            }
            performRPCCall(RPC.Eds.parse, [{eds:eds}], {wait_text: 'Проверяем ЭП...', mask: true}, function(resp){
              if (!resp.success || !resp.eds) {
                echoResponseMessage(resp);
                return;
              }
              var map = {INN: 'inn', FullName: 'contragent_full_name', KPP: 'kpp'};
              for (var t in map) {
                if (!map.hasOwnProperty(t)) {
                  continue;
                }
                if (resp.eds[t]) {
                  Ext.getCmp(component.ids[map[t]]).setValue(resp.eds[t]);
                }
              }
              if (resp.eds.UserFIO) {
                var fio = resp.eds.UserFIO.split(/\s+/);
                var fio_map = ['last_name', 'first_name', 'middle_name'];
                for (var i=0; i<fio_map.length; i++) {
                  if (fio[i]) {
                    Ext.getCmp(component.ids[fio_map[i]]).setValue(fio[i]);
                  }
                }
              }
              if (resp.eds['signed-by'] && resp.eds['signed-by']['dn']) {
                if (resp.eds['signed-by'].dn['id-at-title']) {
                  Ext.getCmp(component.ids.user_job).setValue(resp.eds['signed-by'].dn['id-at-title']);
                }
                if (resp.eds['signed-by'].dn['e-Mail']) {
                  Ext.getCmp(component.ids.user_email).setValue(resp.eds['signed-by'].dn['e-Mail']);
                }
              }
              generateLogin();
              Ext.getCmp(component.ids.inn).fireEvent('blur');
            });
          }
        }]
      },
      {
        xtype: 'Application.components.CommonUserForm',
        ids: component.ids,
        act: action,
        listeners: {
          beforerender: function() {
            var component = this;
            if(component.act=='register') {
              var captcha = {
                xtype:'Application.components.captchaPanel',
                id: component.ids.capanel,
                labelWidth: 200
              };
              component.add(captcha);
            }
          }
        }
      }

      ],
      buttons: [
      {
        text: 'Отмена',
        handler: function() {
          redirect_to('auth/login');
        }
      },
      {
        text: 'Регистрация',
        scope: this,
        id: component.ids.reg_button,
        formBind : true,
        handler: function(){
          var parameters = this.getForm().getValues();
          //var form = this;
          performRPCCall(RPC.Index.register, [parameters], {wait_text: 'Регистрируемся'}, function(result) {
            if(result.success) {
              Ext.Msg.alert('Успешно', 'Пользователь создан успешно. Перед тем как продолжить работу, пожалуйста, подтвердите свой email, пройдя по ссылке из письма, которое только что было Вам отправлено', function() {redirect_to('auth/login');});
            } else {
              echoResponseMessage(result);
              Ext.getCmp(component.ids.capanel).fireEvent('reload');
            }
          });
        }
      }
      ]
    });
    Application.components.NewUserForm.superclass.initComponent.call(this);
  }
});
