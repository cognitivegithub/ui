
Ext.define('Application.components.UserProfileForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  fileUpload: true,
  initComponent : function () {
    var component = this;
    var profile_locked = Main && Main.contragent && Main.contragent.profile_locked;

    var action = (component.act) ? component.act : 'register';

    this.addEvents('reload');

    var fileFieldsetId = Ext.id();
    var userDataForm = Ext.id();

    function loadUserData() {

      var cust_reqFalg=((Main.config.user_documents_required!=undefined) ? (Main.config.user_documents_required):true);
      if (!isAdmin() && !isGendir()) {
        RPC.Reference.getUserRequirements(USER_PROFILE_WITH_EDS, function(files) {
          if (files.success) {
            if (files.filePanels) {
              var file_panels_length = files.filePanels.length;
              for(var ii=0; ii<file_panels_length; ++ii) {
                Ext.apply(files.filePanels[ii], {requiredMark: cust_reqFalg});
              }
            }
            component.add({
              xtype: 'fieldset',
              frame: false,
              disabled: profile_locked,
              id: fileFieldsetId,
              title: 'Документы пользователя',
              style: 'margin: 10px 0 0 0',
              items: [{
                xtype: 'Application.components.FilesPanel',
                file_panels: files.filePanels,
                is_panel: true
              }]
            });
            component.doLayout();
            RPC.User.load(component.userId, component.draft, function(result) {
              if (result.success) {
                var userdata = result.data;
                component.getForm().setValues(userdata);
                if (profile_locked && !userdata.peer_id) {
                  component.insert(1, {
                    xtype: 'panel',
                    cls: 'warning-panel spaced-bottom',
                    html: 'Профиль этого пользователя зарегистрирован локально на этой площадке. '+
                          'Он доступен для изменения, не связан с профилем в СГЗ и не будет передан в СГЗ.<br/>'+
                          'Обращаем внимание, что необходимо подать заявку на регистрацию доверенности пользователя, '+
                          'заполнив настоящую анкету, иначе администратор организации не сможет утвердить доступ.'
                  });
                  Ext.getCmp(fileFieldsetId).enable();
                  Ext.getCmp(userDataForm).enable();
                  component.doLayout();
                }
                loadFilesIntoFilePanels(result.data.user_files, {
                  deleteHandler : function(file, cmp) {
                    performRPCCall(RPC.User.removefile, [{id : file.id}], null, function() {
                      cmp.destroy();
                    });
                  }
                }, false);
              } else {
                Ext.Msg.alert('Ошибка', 'Ваши данные не удалось загрузить.');
              }
            });
          } else {
            Ext.Msg.alert('Ошибка', 'Ваши данные не удалось загрузить.');
          }
        });
      } else {
          RPC.User.load(component.userId, component.draft, function(result) {
            if (result.success) {
              var userdata = result.data;
              userdata['no_date_valid_for'] = !userdata['has_date_valid_for'];
              component.getForm().setValues(userdata);
            } else {
              Ext.Msg.alert('Ошибка', 'Ваши данные не удалось загрузить.');
            }
          });
      }
    }

    var hideOrganizationForm = isAdmin() || isGendir();

    Ext.apply(this, {
      autoHeight: true,
      layout : 'form',
      title: component.title,
      frame: true,
      bodyCssClass: 'subpanel-top-padding',
      defaults: {
        anchor: '100%',
        stateful: true,
        autoHeight: true,
        allowBlank: false,
        labelWidth: 200,
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
      items : [
      {
        title: 'Данные об организации',
        layout: 'form',
        hidden: hideOrganizationForm,
        defaults: {
          xtype: 'textfield',
          anchor: '100%'
        },
        items: [{
          fieldLabel: 'ИНН',
          name: 'company[inn]',
          disabled: true
        }, {
          fieldLabel: 'КПП',
          name: 'company[kpp]',
          disabled: true
        }, {
          fieldLabel: 'Полное наименование',
          name: 'company[full_name]',
          disabled: true
        }]
      },
      {xtype: 'Application.components.CommonUserForm',
        act: action,
        id: userDataForm,
        userId: component.userId,
        departmentSelectedId: component.departmentId,
        disabled: profile_locked,
        autoLock: false,
        listeners: {
          beforerender: function() {
            var component = this;
            if(component.act=='register') {
              var captcha = {
                xtype:'Application.components.captchaPanel',
                //id: 'capanel',
                labelWidth: 200
              };
              component.add(captcha);
            }
            /* #15882
              else {
              var contragent_accreds = Main.contragent.supplier_accreditations;
              if(contragent_accreds && contragent_accreds.length>0) {
               var profile_id = contragent_accreds[0].profile_id;
               if(profile_id==SUPPLIER_TYPE_UR_RF || profile_id==SUPPLIER_TYPE_UR_FOREIGN) {
                 var max_sum_field = {
                   xtype: 'textfield',
                   name:'max_sum',
                   fieldLabel: 'Максимальная сумма сделки'
                 };
                 component.add(max_sum_field);
               }
              }
            } */
          }
        }
      }],
      buttons: [
      {
        text: 'Отмена',
        handler: function() {
          history.back(-1);
        }
      },
      //{
      //  text: 'Сохранить',
      //  scope: this,
      //  formBind : true,
      //  handler: function(){
      //    var form = this;
      //    if(this.getForm().isValid()) {
      //      performSave(form, null, 'reload');
      //    }
      //  }
      //},
      {
        text: 'Сохранить',
        scope: this,
        formBind : true,
        handler: function() {
          var form = this;
          if(form.getForm().isValid()) {
              performSave(form, 'user/sign/act/'+form.act+'/user_id/'+component.userId,undefined,null,false);
          }
        }
      }
      ],
      listeners: {
        afterrender: function() {
           loadUserData();
        },
        reload : function() {
          component.remove(Ext.getCmp(fileFieldsetId));
          fileFieldsetId = Ext.id();
          loadUserData();
        }
      }
    });
    if (profile_locked) {
      this.items.unshift({
        xtype: 'panel',
        cls: 'warning-panel spaced-bottom',
        html: 'Т.к. у вашей организации есть аккредитация в <a href="https://etp.roseltorg.ru/">системе для государственных заказчиков (СГЗ)</a>, профиль пользователя не доступен для изменения на данной площадке. '+
              'Для изменения данных профиля следует изменять соответствующие сведения в личном кабинете СГЗ, все изменения будут перенесены сюда черех пару минут. '+
              'Также обращаем внимание, что при изменении данных в СГЗ, информация профиля будет перезаписана для соответствия профилю в СГЗ.'
      });
    }
    if (isAdmin()) {
      this.items.push({title: 'Данные регистрации',
        style: 'margin: 10px 0 0',
        ref: 'regInfo',
        hidden: component.act != 'edit',
        items: [
          {
            xtype: 'checkbox',
            fieldLabel: 'Действует до',
            name: 'no_date_valid_for',
            boxLabel: 'Без срока',
            allowBlank: true,
            scope: this,
            listeners: {
              check: function(field, status) {
                component.regInfo.has_date_valid_for.setValue(status);
                if (status) {
                  component.regInfo.valid_for.reset();
                  component.regInfo.valid_for.disable();
                } else {
                  component.regInfo.valid_for.enable();
                }
              }
            }
          },
          {
            xtype:'hidden',
            name: 'has_date_valid_for',
            ref: 'has_date_valid_for'
          },
          {
            xtype: 'Application.components.dateField',
            format: 'd.m.Y',
            altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
            ref:'valid_for',
            hideLabel: false,
            name: 'valid_for',
            anchor: 0,
            minValue: now()}]
      });
    }
    Application.components.UserProfileForm.superclass.initComponent.call(this);

    this.form.api = {
        submit: RPC.User.save
    };
    this.form.waitMsgTarget = true;
  }
});
