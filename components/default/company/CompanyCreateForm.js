/**
 * Ручное создание организации администратором
 */
Application.components.CompanyCreateForm = Ext.extend(Ext.Panel, {

  contragent_id: null,
  redirect_link: null,

  initComponent : function () {
    var component = this;

    /**
     * Загрузка Компании.
     * @returns {void}
     */
    function loadCompanyData() {
      if (!component.contragent_id) {
        return;
      }
      performRPCCall(RPC.Company.load, [{id:component.contragent_id}], null, function(resp) {
        if (resp.success) {
          component.cmp_data = resp.data;
          if (component.cmp_data.customer_profile_id && component.cmp_data.customer_profile_id != null) {
            component.customer_profile_id = component.cmp_data.customer_profile_id
          }

          if (component.cmp_data.supplier_profile_id && component.cmp_data.supplier_profile_id != null) {
            component.supplier_profile_id = component.cmp_data.supplier_profile_id
          }
          setComponentValues(component, resp.data, true);
          component.doLayout();
        } else {
          echoResponseMessage(resp);
        }
      });
      return;
    }

    var items = [{
      name: 'id',
      xtype: 'hidden'
    }].concat(this.createCommonItems()).concat(this.createExtraItems());

    Ext.apply(this, {
      layout: 'form',
      frame: true,
      labelWidth: 300,
      bodyCssClass: 'subpanel-top-padding',
      defaults: {
        anchor: '100%',
        autoHeight: true,
        allowBlank: false,
        xtype: 'textfield',
        msgTarget: 'under'
      },
      items: items,
      buttons: [
        {
          text: component.contragent_id ? t('Редактировать организацию') : t('Создать организацию'),
          handler: this.createContragent,
          scope: this
        },
        {
          text: 'Отмена',
          handler: function() {
              history.back(NO_MAGIC_NUMBER_ONE);
          }
        }
      ],
      listeners : {
        afterrender: function() {
          loadCompanyData();
        }
      }
    });
    Application.components.CompanyCreateForm.superclass.initComponent.call(this);
  },
  createContragent: function() {
    var component = this;
    if (!isFormValid(this)) {
      return;
    }
    var values = {};
    collectComponentValues(this, values);
    if (!values.id && Main.config.default_accreditation_id) {
      values.customer = 'on';
      values.customer_profile_id = Main.config.default_accreditation_id;
    }
    getSignatureEx(Ext.encode(values), function(signature){
      values.signature = signature;
      values.override_draft = true;
      performRPCCall(RPC.Company.create, [values], null, function (result) {
          if (result.success) {
            if (component.redirect_link) {
              redirect_to(component.redirect_link);
            } else {
              history.back(NO_MAGIC_NUMBER_MINUS_ONE);
            }
          } else {
            echoResponseMessage(result);
          }
      });
    });
  },
  createCommonItems: function() {
    var postal_address_id = Ext.id();
    var legal_address_id = Ext.id();
    return [{
      name: 'short_name',
      fieldLabel: (Main.config.no_accreditation
        ? t('contragent_full_name_title')
        : 'Полное наименование организации (Ф.И.О. в случае аккредитации физического лица)') + REQUIRED_FIELD,
      minLength: 3,
      maxLength: 1000
    }, {
      name: 'full_name',
      fieldLabel: t('Сокращенное наименование организации') + REQUIRED_FIELD,
      minLength: 3,
      maxLength: 1000
    }, {
      name: 'inn',
      maskRe: /\d/,
      fieldLabel: 'ИНН' + REQUIRED_FIELD,
      vtype: (Main.config.validate_company_inn ? 'inn' : 'digits'),
      minLength: 10,
      maxLength: 12
    }, {
      name: 'kpp',
      maskRe: /\d/,
      fieldLabel: 'КПП',
      vtype: 'digits',
      minLength: 9,
      maxLength: 9,
      allowBlank: true
    }, {
      name: 'ogrn',
      maskRe: /\d/,
      fieldLabel: 'ОГРН',
      vtype: 'digits',
      minLength: 10,
      maxLength: 15,
      allowBlank: true
    }, {
      name: 'contact_fio',
      fieldLabel: 'Контактное лицо' + REQUIRED_FIELD,
      minLength: 3,
      maxLength: 1000
    }, {
      name: 'phone',
      fieldLabel: 'Телефон' + REQUIRED_FIELD,
      xtype: 'Application.components.phonePanel'
    }, {
      xtype: 'textfield',
      name: 'email',
      vtype: 'email',
      fieldLabel: 'Адрес электронной почты' + REQUIRED_FIELD
    }, {
      xtype: 'fieldset',
      title: 'Юридический адрес',
      items:[
        {
          xtype: 'Application.components.addressPanel',
          name: 'legal',
          id: legal_address_id,
          getValues : function() {
            var v = {};
            collectComponentValues(this, v, true);
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
          listeners: {
            check: function() {
              if (this.checked) {
                var legal = Ext.getCmp(legal_address_id);
                var postal = Ext.getCmp(postal_address_id);
                var fields = [
                  'index', 'okato', 'oktmo', 'region', 'city', 'settlement', 'street', 'house', 'country_iso_nr'
                ];
                var legal_vals = legal.getValues();
                var postal_vals = postal.getValues();
                var v = {
                  id: postal_vals.id ? postal_vals.id : null,
                  address_type: postal_vals.address_type ? postal_vals.address_type : null
                };
                for (var i = 0; i < fields.length; i++) {
                  v[fields[i]] = legal_vals[fields[i]];
                }
                postal.setValues(v);
              }
            }
          }
        },
        {
          xtype: 'Application.components.addressPanel',
          name: 'postal',
          id: postal_address_id,
          getValues : function() {
            var v = {};
            collectComponentValues(this, v, true);
            return v;
          }
        }
      ]
    }];
  },
  createExtraItems: function() {
    var component = this;
    var profile_combo_id = Ext.id();
    return [{
      xtype:          'combo',
      fieldLabel:     t('Головная организация') + REQUIRED_FIELD,
      store :         createCompanyStore(),
      emptyText:      t('Введите часть наименования, л/с или ИНН организации'),
      name:           'main_contragent_id',
      mode:           'remote',
      valueField:     'id',
      displayField:   'full_name',
      tpl: new Ext.XTemplate(
        '<tpl for="."><div class="search-item {[xindex % 2 === 0 ? "x-even" : "x-odd"]}">',
        'Л/с <b>{account}</b>, ИНН <b>{inn}</b><tpl if="kpp">, КПП <b>{kpp}</b></tpl> {full_name}',
        '</div></tpl></tpl>'
      ),
      itemSelector:   'div.search-item',
      style:          'margin-bottom: 10px',
      allowBlank:     false,
      minChars:       3,
      pageSize:       10,
      hideTrigger:    true,
      forceSelection: true,
      triggerAction:  'all',
      disabled: component.contragent_id,
      hidden: component.contragent_id
    }, {
      xtype: 'checkbox',
      name: 'customer',
      hideLabel: true,
      boxLabel: 'Аккредитовать организацию как заказчика',
      checked: !Main.config.no_accreditation,
      hidden: Main.config.no_accreditation,
      listeners: {
        check: function(cb, checked) {
          var profile_combo = Ext.getCmp(profile_combo_id);
          if (checked && !Main.config.no_accreditation) {
            profile_combo.enable();
          } else {
            profile_combo.disable();
          }
        }
      }
    }, {
      xtype: 'combo',
      name: 'customer_profile_id',
      fieldLabel: 'Тип заказчика',
      id: profile_combo_id,
      store: getProfileStore('customer'),
      editable: false,
      hidden: Main.config.no_accreditation,
      disabled: Main.config.no_accreditation,
      displayField: 'name',
      valueField: 'id',
      triggerAction: 'all'
    }];
  }
});
