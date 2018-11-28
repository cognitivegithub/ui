
Application.components.CompanyForm = Ext.extend(Ext.Panel, {

  initComponent : function () {
    var component = this;
    var profile_locked = Main.contragent.profile_locked;
    var edit_ro = profile_locked || ((component.act=='edit') ? true : false);
    var ro_class = profile_locked?'x-readonly':'';
    var edit_ro_class = edit_ro?ro_class:'';
    var TIP_KPP = '<img src="/css/images/default/shared/warning.gif" ext:qtip="Данная строка обязательна для заполнения юридическим лицам."/>';
    var TIP_SHORT_NAME = '<img src="/css/images/default/shared/warning.gif" ext:qtip="Если Выпиской из ЕГРЮЛ и Уставом предусмотрено сокращенное наименование, то данная строка обязательна к заполнению."/>';
    this.ogrn_req = '';
    if(component.required_ogrn) {
      component.ogrn_req = REQUIRED_FIELD;
    }
    component.kpp_req = '';
    if(component.required_kpp) {
      component.kpp_req = REQUIRED_FIELD;
    }

    this.addEvents(['changeCompanyType']);

    function loadPostalFromLegal() {
      var legal = Ext.getCmp('legal');
      var postal = Ext.getCmp('postal');
      var fields = ['index', 'okato', 'region', 'city', 'settlement', 'street', 'house', 'country_iso_nr'];
      var legal_vals = legal.getValues();
      var postal_vals = postal.getValues();
      var v = {
        id: postal_vals.id ? postal_vals.id : null,
        address_type: postal_vals.address_type ? postal_vals.address_type : null
      };
      for(var i=0; i<fields.length; i++) {
        v[fields[i]] = legal_vals[fields[i]];
      }
      postal.setValues(v);
    }

    Ext.apply(this,
      {
        layout : 'form',
        anchor: '100%',
        labelWidth: 200,
        frame: true,
        autoHeight: true,
        bodyCssClass: 'subpanel-top-padding',
        border: false,
        defaults: {
          anchor: '100%',
          allowBlank: false,
          minLengthText: 'Слишком короткое значение',
          maxLengthText: 'Слишком длинное значение'
        },

        items: [
        {
        xtype: 'fieldset',
        layout: 'form',
        labelWidth: 200,
        defaults: {
          anchor: '100%'
        },
        title: 'Основные данные профиля',
        items: [
        {
          xtype: 'hidden',
          name: 'id',
          value: Main.stores.cmp_id
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
            id: 'contragent_full_name',
            fieldLabel: 'Полное наименование организации (Ф.И.О. в случае аккредитации физического лица)'+REQUIRED_FIELD,
            readOnly: edit_ro,
            cls: edit_ro_class,
            disabled: (component.act=='edit') ? true : false,
            minLength: 3,
            maxLength: 1000
          }]
        },
        {
          xtype: 'textfield',
          name: 'short_name',
          fieldLabel: 'Краткое наименование'+TIP_SHORT_NAME,
          readOnly: profile_locked,
          id: 'short_name',
          cls: ro_class,
          allowBlank: true,
          minLength: 3,
          maxLength: 500
        },
        {
          xtype: 'textfield',
          name: 'inn',
          id: 'inn',
          vtype: (Main.config.validate_company_inn ? 'inn' : null),
          minLength: 10,
          maxLength: 12,
          emptyText: '10 - 12 цифр',
          fieldLabel: 'ИНН'+REQUIRED_FIELD
        },
        {
          xtype: 'textfield',
          name: 'ogrn',
          vtype: 'digits',
          minLength: 10,
          id: 'ogrn',
          maxLength: 15,
          allowBlank: true,
          emptyText: '10 - 15 цифр',
          fieldLabel: 'ОГРН'+TIP_KPP,
          readOnly: edit_ro,
          cls: edit_ro_class,
          disabled: (component.act=='edit') ? true : false
        },
        {
          xtype: 'textfield',
          name: 'kpp',
          vtype: 'digits',
          minLength: 9,
          maxLength: 9,
          id: 'kpp',
          allowBlank: true,
          emptyText: '9 цифр',
          fieldLabel: 'КПП'+TIP_KPP,
          readOnly: edit_ro,
          cls: edit_ro_class,
          disabled: (component.act=='edit') ? true : false
        },
          {
                xtype: 'textfield',
                name: 'okpo',
                id: 'okpo',
                allowBlank: true,
                fieldLabel: 'ОКПО',
                readOnly: profile_locked,
                cls: ro_class,
                disabled: (component.act=='edit') ? true : false
            },
            {
                xtype: 'textfield',
                name: 'okopf',
                id: 'okopf',
                allowBlank: true,
                fieldLabel: 'ОКОПФ',
                readOnly: profile_locked,
                cls: ro_class,
                disabled: (component.act=='edit') ? true : false
            },
        {
          xtype: 'combo',
          store: new Ext.data.ArrayStore({
              fields: ['id','type'],
              data: [[1, 'Организация, попадающая под действие 223-ФЗ'], [2, 'Коммерческая организация']]
          }),
          displayField: 'type',
          valueField: 'id',
          editable: false,
          triggerAction: 'all',
          forceSelection: true,
          mode: 'local',
          emptyText: 'Выберите тип организации',
          fieldLabel: 'Тип организации',
          name: 'customer_type',
          readOnly: profile_locked,
          disabled: profile_locked
        },
        {
          xtype: 'checkbox',
          readOnly: profile_locked,
          disabled: profile_locked,
          boxLabel: 'Является предприятием малого/среднего бизнеса',
          name: 'small_biz'
        },
        {
          xtype: 'textfield',
          name: 'website',
          id: 'website',
          //vtype: 'url',
          //readOnly: profile_locked,
          //cls: ro_class,
          allowBlank: true,
          fieldLabel: 'Адрес сайта'
        },
        {
          xtype: 'textfield',
          name: 'email',
          //readOnly: profile_locked,
          //cls: ro_class,
          id: 'email',
          vtype: 'email',
          fieldLabel: 'Адрес электронной почты'+REQUIRED_FIELD
        },
        {
          xtype: 'textfield',
          name: 'email_add',
          //readOnly: profile_locked,
          //cls: ro_class,
          allowBlank: true,
          fieldLabel: 'Дополнительные адреса электронной почты'
        },
        {
          xtype: 'Application.components.phonePanel',
          name: 'phone',
          readOnly: profile_locked,
          itemsCssClass: ro_class,
          fieldLabel: 'Телефон'+REQUIRED_FIELD
        },
        {
          xtype: 'Application.components.phonePanel',
          name: 'fax',
          readOnly: profile_locked,
          itemsCssClass: ro_class,
          allowBlank: true,
          fieldLabel: 'Факс'
        },
        {
          xtype: 'textfield',
          name: 'contact_fio',
          allowBlank: true,
          //readOnly: profile_locked,
          //cls: ro_class,
          id: 'contact_fio',
          fieldLabel: 'Контактное лицо',
          minLength: 3,
          maxLength: 255
        }]},
        {
          xtype: 'fieldset',
          title: 'Сведения о руководителе организации',
          hidden: true,
          labelWidth: 200,
          defaults: {
            anchor: '100%'
          },
          items:[{
            xtype: 'textfield',
            name: 'head_last_name',
            fieldLabel: 'Фамилия руководителя',
            minLength: 2,
            maxLength: 100
          }, {
            xtype: 'textfield',
            name: 'head_first_name',
            fieldLabel: 'Имя руководителя',
            minLength: 2,
            maxLength: 100
          }, {
            xtype: 'textfield',
            name: 'head_middle_name',
            fieldLabel: 'Отчество руководителя',
            minLength: 2,
            maxLength: 100
          }, {
            xtype: 'textfield',
            name: 'head_job',
            fieldLabel: 'Должность руководителя',
            minLength: 2,
            maxLength: 255
          }]
        }, {
          xtype: 'fieldset',
          title: 'Юридический адрес',
          items:[
            {
              xtype: 'Application.components.addressPanel',
              name: 'legal',
              id: 'legal',
              readOnly: profile_locked,
              itemsCssClass: ro_class,
              getValues : function() {
                var v = {};
                collectComponentValues(this, v,true);
                return v;
              }
            }
          ]
        }, {
          xtype: 'fieldset',
          title: 'Почтовый адрес',
          labelWidth: 200,
          items:[
            {
              xtype: 'checkbox',
              boxLabel: 'Совпадает с юридическим',
              name:'postaleqlegal',
              //disabled: profile_locked,
              //cls: ro_class,
              listeners: {
                check: function() {
                  if (this.checked) {
                    loadPostalFromLegal();
                  }
                }
              }
            },
            {
              xtype: 'Application.components.addressPanel',
              name: 'postal',
              id: 'postal',
              //readOnly: profile_locked,
              //itemsCssClass: ro_class,
              getValues : function() {
                var v = {};
                collectComponentValues(this, v,true);
                return v;
              }
            }
          ]
        },
        {
          xtype: 'fieldset',
          title: 'Банковские реквизиты',
          items:[
          {
            xtype: 'Application.components.bankdataPanel',
            readOnly: profile_locked,
            itemsCssClass: ro_class,
            numIndex: 0
          }
        ]
      }
      ],
        listeners: {
          'changeCompanyType': function (params) {
            var kpp = Ext.getCmp('kpp');
            var ogrn = Ext.getCmp('ogrn');
            var short_name = Ext.getCmp('short_name');
            if (params.newType == 1 || params.newType == 4) {
              kpp.allowBlank = false;
              kpp.label.update('КПП' + REQUIRED_FIELD+TIP_KPP);
              ogrn.allowBlank = false;
              ogrn.label.update('ОГРН' + REQUIRED_FIELD+TIP_KPP);
              short_name.allowBlank = false;
              short_name.label.update('Краткое наименование' + REQUIRED_FIELD+TIP_SHORT_NAME);
            } else {
              kpp.allowBlank = true;
              kpp.label.update('КПП'+TIP_KPP);
              ogrn.allowBlank = true;
              ogrn.label.update('ОГРН'+TIP_KPP);
              short_name.allowBlank = true;
              short_name.label.update('Краткое наименование'+TIP_SHORT_NAME);
            }
          }
        },
        getValues : function() {
          var v = {};
          collectComponentValues(component, v,true);
          return v;
        },
        setValues : function(v) {
          setComponentValues(component, v, true);
        }
      });
    if (profile_locked) {
      this.items.unshift({
        xtype: 'panel',
        cls: 'warning-panel spaced-bottom',
        html: 'Т.к. у вашей организации есть аккредитация в <a href="https://etp.roseltorg.ru/">системе для государственных заказчиков (СГЗ)</a>, не все значения доступны к изменению на данной площадке. '+
              'Для изменения данных профиля следует изменять аккредитационные сведения в личном кабинете СГЗ, все изменения будут перенесены сюда черех пару минут. '+
              'Также обращаем внимание, что при изменении данных в СГЗ, информация профиля будет перезаписана для соответствия профилю в СГЗ.'
      });
    }
    Application.components.CompanyForm.superclass.initComponent.call(this);
  }
});
