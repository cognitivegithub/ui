
Ext.define('Application.components.edsReapplyForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  fileUpload: true,
  initComponent : function () {
    var component = this;
    var reg_button_id = Ext.id();

    Ext.apply(this, {
      autoHeight: true,
      layout : 'form',
      title: component.title,
      frame: true,
      bodyCssClass: 'subpanel subpanel-top-padding',
      defaults: {
        anchor: '100%',
        autoHeight: true,
        allowBlank: false,
        labelWidth: 280,
        xtype: 'fieldset',
        layout: 'form',
        defaults: {
          anchor: '100%',
          msgTarget: 'under',
          allowBlank: false
        }
      },
      monitorValid : true,
      items : [
      {
        title: 'Текущие данные организации',
        id: 'companyInfoCnt'
      },
      {
        title: 'Данные об организации из ЭП',
        style: 'margin: 0px',
        disabled: Main.contragent.profile_locked,
        bodyCssClass: 'subpanel',
        items: [
        {
          xtype: 'textfield',
          name: 'full_name',
          id: 'contragent_full_name',
          fieldLabel: 'Полное наименование организации',
          readOnly: true
        },
        {
          xtype: 'textfield',
          name: 'inn',
          id: 'inn',
          vtype: (Main.config.validate_company_inn ? 'inn' : null),
          minLength: 10,
          maxLength: 12,
          fieldLabel: 'ИНН',
          readOnly: true
        },
        {
          xtype: 'textfield',
          name: 'kpp',
          vtype: 'digits',
          minLength: 9,
          maxLength: 9,
          id: 'kpp',
          fieldLabel: 'КПП',
          readOnly: true
        },
        {
          xtype: 'textfield',
          name: 'orgn',
          vtype: 'digits',
          id: 'ogrn',
          fieldLabel: 'ОГРН',
          readOnly: true
        }],
        buttons: [{
          text: 'Заполнить из ЭП',
          handler: function() {
            var eds = signData('-', true);
            if (!checkSignatureResult(eds)) {
              return;
            }
            performRPCCall(RPC.Eds.parse, [{eds:eds}], {wait_text: 'Загрузка ЭП...', mask: true}, function(resp){
              if (!resp.success || !resp.eds) {
                echoResponseMessage(resp);
                return;
              }
              var map = {INN: 'inn', KPP: 'kpp', OGRN: 'ogrn', FullName: 'contragent_full_name'};
              for (var t in map) {
                if (!map.hasOwnProperty(t)) {
                  continue;
                }
                if (resp.eds[t]) {
                  Ext.getCmp(map[t]).setValue(resp.eds[t]);
                }
              }
              Ext.getCmp(reg_button_id).setDisabled(false);
            });
          }
        }]
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
        text: 'Подписать и направить',
        id: reg_button_id,
        scope: this,
        disabled: true,
        formBind : true,
        handler: function() {
          var params = {
            contragent_full_name: Ext.getCmp('contragent_full_name').getValue(),
            inn: Ext.getCmp('inn').getValue(),
            kpp: Ext.getCmp('kpp').getValue(),
            ogrn: Ext.getCmp('ogrn').getValue()
          };
          performRPCCall(RPC.Company.signatureEdsReapplyText, [params], {wait_text: 'Формирование текста на подпись...', mask: true}, function(resp){
            if (!resp.success) {
              echoResponseMessage(resp);
              return;
            }
            var win = new Application.components.promptWindow({
              title: 'Заявка на переаккредитацию',
              cmpType: 'Application.components.SignatureForm',
              parentCmp: this,
              cmpParams: {
                api: RPC.Company.signEdsReapply,
                signatureText : resp.message,
                signatureTextHeight: 250,
                useFormHandler: false,
                success_fn : function() {
                  win.close();
                },
                items: []
              }
            });
            win.show();
          });
        }
      }
      ],
      listeners: {
        render: function() {
          var uTpl = getShortCompanydataTemplate();
          RPC.Company.view({id: Main.user.contragent_id}, function(result) {
            var uDt = result.cmp;
            var companyPanel = new Ext.Panel(
            {
              frame: false,
              layout: 'table',
              tpl: uTpl,
              data: uDt
            });

            Ext.getCmp('companyInfoCnt').insert(0, companyPanel);
            Ext.getCmp('companyInfoCnt').doLayout();
          });
        }
      }
    });
    if (Main.contragent.profile_locked) {
      this.items.unshift({
        xtype: 'panel',
        cls: 'warning-panel spaced-bottom',
        html: 'Т.к. у вашей организации есть аккредитация в <a href="https://etp.roseltorg.ru/">системе для государственных заказчиков (СГЗ)</a>, переаккредитация на данной площадке невозможна. '+
              'Для изменения данных следует пройти переаккредитацию СГЗ, все изменения будут перенесены сюда черех пару минут.'
      });
    }
    Application.components.edsReapplyForm.superclass.initComponent.call(this);
  }
});
