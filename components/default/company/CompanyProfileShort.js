Application.components.CompanyProfileShort = Ext.extend(Ext.Panel, {
    frame : false,
    border : false,
    initComponent : function () {
        var component = this;
        this.ogrn_req = '';

        var uTpl = getCompanydataTemplate();
        var balanceTpl = getBalanceTemplate();
        var bankdataTpl = getBankshortdataTemplate();
        var bank_data = component.cmpdata.bank_data;

        Ext.apply(this,
            {
                xtype: 'panel',
                border: false,
                frame: true,
                layout : 'form',
                title: 'Сведения об организации',
                bodyCssClass: 'subpanel-top-padding',
                items: [
                    {
                        xtype: 'fieldset',
                        tpl: uTpl,
                        title: 'Основные данные профиля',
                        data: component.cmpdata
                    },
                    {
                        xtype: 'fieldset',
                        tpl: bankdataTpl,
                        title: 'Банковские реквизиты',
                        data: bank_data,
                        hidden: !bank_data
                    }
                    ],
                buttons: [
                    {
                        text: 'Назад',
                        scope: this,
                        formBind : true,
                        handler: function(){
                                history.back(1);
                        }
                    }]

            });

        Application.components.CompanyProfileShort.superclass.initComponent.call(this);
    }
});