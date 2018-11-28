
Application.components.SignatureTabPanel = Ext.extend(Ext.TabPanel, {
  frame :false,
  border : false,
  initComponent : function () {
    var component = this;

    var customer_accred_id = Ext.id();
    var supplier_accred_id = Ext.id();

    var tabpanel_id = Ext.id();

    function loadCompanyData() {
      performRPCCall(RPC.Company.signaturetext,[{id:component.cmpid, type:component.type}], null, function(resp){
        if(resp.success) {
          var supplier_signature = '', customer_signature='';
          if(component.customer_profile_id!=null||component.type=='both') {
            customer_signature = resp.signature_text.customer_signature;
            Ext.getCmp('customer_signature_text').setValue(customer_signature);
            if(component.type!='both')
              Ext.getCmp(supplier_accred_id).destroy();
          }
          if(component.supplier_profile_id!=null||component.type=='both') {
            supplier_signature = resp.signature_text.supplier_signature;
            Ext.getCmp('supplier_signature_text').setValue(supplier_signature);
            if(component.type!='both')
              Ext.getCmp(customer_accred_id).destroy();
          }

          component.doLayout();
        } else {
          if (resp.contragent_id_is_null) {
            component.hide();
            Ext.Msg.alert('Ошибка', resp.message, function(btn){
              if(btn){
                window.history.go(-1);
              }
            });
          } else {
            echoResponseMessage(resp);
          }
        }
      });
      return;
    }

    function getSignature(v) {
      if ('none'==Main.eds.mode_as_is && component.act != 'edit') {
        return 'a';
      }
      if ('none'==Main.eds.mode && component.act == 'edit') {
        return 'a';
      }
      return signData(v, 1);
    }

    function signForm(form, success_fn) {
      var formValues = form.getValues();

      if ( component.supplier_profile_id!=null && component.customer_profile_id!=null ) {
        formValues.type='both';
        formValues.supplier_profile_id=component.supplier_profile_id;
        formValues.customer_profile_id=component.customer_profile_id;

        if ('none'!=Main.eds.mode_as_is && !Main.eds.crypt_supplier && component.act != 'edit') {
          formValues.supplier_signature = 'a';
        } else {
          formValues.supplier_signature = getSignature(formValues['supplier_signature_text']);
        }

        if ('none'!=Main.eds.mode_as_is && !Main.eds.crypt_customer && component.act != 'edit') {
          formValues.customer_signature = 'a';
        } else {
          formValues.customer_signature = getSignature(formValues['customer_signature_text']);
        }

        if (!checkSignatureResult(formValues.customer_signature) ||
            !checkSignatureResult(formValues.supplier_signature)) {
          return false;
        }
      } else if(component.supplier_profile_id!=null) {
        formValues.type='supplier';
        formValues.supplier_profile_id=component.supplier_profile_id;

        if ('none'!=Main.eds.mode_as_is && !Main.eds.crypt_supplier && component.act != 'edit') {
          formValues.supplier_signature = 'a';
        } else {
          formValues.supplier_signature = getSignature(formValues['supplier_signature_text']);
        }

        if (!checkSignatureResult(formValues.supplier_signature) ) {
          return false;
        }
      }
      else if(component.customer_profile_id!=null) {
        formValues.type='customer';
        formValues.customer_profile_id=component.customer_profile_id;

        if ('none'!=Main.eds.mode_as_is && !Main.eds.crypt_customer && component.act != 'edit') {
          formValues.customer_signature = 'a';
        } else {
          formValues.customer_signature = getSignature(formValues['customer_signature_text']);
        }

        if (!checkSignatureResult(formValues.customer_signature) ) {
          return false;
        }
      }

      formValues.act = component.act;

      var onSuccess = function(resp) {
        echoResponseMessage(resp);
        if (!resp.success) {
          return;
        }
        if (success_fn) {
          success_fn(resp);
        } else if (resp.redirect_url) {
          redirect_to(resp.redirect_url);
        } else if (resp.result.redirect_url) {
          redirect_to(resp.result.redirect_url);
        }
      }

      var params = {
        mask: true,
        wait_text: 'Осуществляем подпись...'
      };
      performRPCCall(form.api, [formValues], params, function(result){
        onSuccess(result);
      });

      return true;
    }

    Ext.apply(this,
     {
      title: 'Заявки на аккредитацию',
      activeTab: 0,
      enableTabScroll:false,
      id: tabpanel_id,
      border: false,
      frame: true,
      items : [
        {
          xtype: 'Application.components.SignaturePanel',
          cmp_id: component.cmpid,
          cmptype: 'customer',
          cls: 'spaced_panel',
          title: 'Аккредитация в качестве заказчика',
          id: customer_accred_id,
          profile_id: component.customer_profile_id
        },
        {
          xtype: 'Application.components.SignaturePanel',
          cmp_id: component.cmpid,
          cls: 'spaced_panel',
          cmptype: 'supplier',
          title: 'Аккредитация в качестве заявителя',
          id: supplier_accred_id,
          profile_id: component.supplier_profile_id
        }
      ],
      buttons: [
      {
        text: 'Назад',
        scope: this,
        formBind : true,
        handler: function(){
          if (component.backUrl == 'history.back') {
            history.back(1);
          } else {
            redirect_to(component.backUrl)
          }
        }
      },
      {
        text: 'Подписать',
        scope: this,
        handler: function(){
          var confirm = '';
          if ( component.type=='both' ) {
            confirm = 'Вы внимательно прочли тексты обеих заявок на аккредитацию перед подачей и хотите подписать?';
          } else {
            confirm = 'Вы внимательно прочли текст заявки на аккредитацию перед подачей и хотите подписать?';
          }

          Ext.Msg.confirm('Подтверждение', confirm, function(r) {
            if ('yes'==r) {
              signForm(component);
            }
          });
        }
      }
      ],
      listeners : {
        afterrender: function() {
          loadCompanyData();
        }
      },
      getValues : function() {
        var v = {};
        collectComponentValues(this, v, false);
        return v;
      }
    });
    Application.components.SignatureTabPanel.superclass.initComponent.call(this);
  }
});
