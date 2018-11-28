Ext.define('Application.components.ProcedureGridColumns', {
    extend: 'Ext.grid.ColumnModel',
    config: {
        columns: null
    },
    updatecheck_rows: ['date_end_registration', 'date_begin_auction'],

    constructor: function (config) {
        var cmp = this;
        this.actions = config.actions;
        this.expander = this.getExpander();
        //var updatecheck_rows = ['date_end_registration', 'date_begin_auction'];
        var cols = [];
        cols.push(this.expander);
        cols.push({header: 'Идентификатор', dataIndex: 'id', width: 20, sortable: true, hidden: true});
        cols.push({header: 'Номер', dataIndex: 'remote_id', width: 40, sortable: true, hidden: !Main.config.procedure_remote_id_visible || !isCustomer()});
        cols.push({header: 'Реестровый №', dataIndex: 'registry_number', width: 70, sortable: true, renderer: this.regNumRenderer});
        cols.push({header: 'Способ определения поставщика', dataIndex: 'procedure_type', width: 20, sortable: true, renderer: this.procTypeRenderer});
        cols.push({header: 'Организатор', dataIndex: 'full_name', width: 60, sortable: true});
        cols.push({header: 'Наименование', dataIndex: 'title', width: 200, sortable: true, renderer: this.titleRenderer});
        cols.push({header: 'Заказчик', width: 150, sortable: true, hidden: !isCustomerSpecorg() || !Main.config.customers_search_for_specorg,
            renderer: function (v, m, r) {
                var val = Application.models.Procedure.multiValueRenderer(cmp.customersRenderer, 'customers', m, r);
                if (!val) {
                    val = cmp.customersRenderer(v, m, r);
                }
                return val;
            }});
        cols.push({header: 'Публикация', dataIndex: 'date_published', width: 60, sortable: true, hidden: true, scope: cmp,renderer: this.dateRenderer});
        cols.push({header: 'Заявок', width: 60, sortable: true, hidden: true, renderer: function (v, m, r) {
            return Application.models.Procedure.multiValueRenderer(cmp.ApplicsCountRenderer, 'applics_count', m, r);
        }});
        cols.push({header: 'Прием заявок до', dataIndex:'date_end_registration', width: 60, sortable: true, renderer: function (v, m, r) {
            return Application.models.Procedure.multiValueRenderer(cmp.dateRenderer, 'date_end_registration', m, r);
        }});
        cols.push({header: 'Дата проведения аукциона', dataIndex:'date_begin_auction', width: 60, sortable: true, hidden: true, renderer: function (v, m, r) {
            return Application.models.Procedure.multiValueRenderer(cmp.dateRenderer, 'date_begin_auction', m, r);
        }});
        cols.push({header: 'Дата окончания аукциона', dataIndex:'date_end_auction', width: 60, sortable: true, hidden: true, renderer: function (v, m, r) {
            return Application.models.Procedure.multiValueRenderer(cmp.dateRenderer, 'date_end_auction', m, r);
        }});
        cols.push({header: 'Сумма', dataIndex: 'total_price', width: 60, sortable: true, align: 'right', renderer: this.currencyRenderer});
        cols.push({header: 'Статус',dataIndex:'status', width: 60, sortable: true,
            renderer: function (v, m, r) {
                var val = Application.models.Procedure.multiValueRenderer(Application.models.Procedure.statusRenderer, 'status', m, r);
                if (!val) {
                    val = Application.models.Procedure.statusRenderer(null, m, r);
                }
                return val;
            }});
        cols.push({header: 'Операции', xtype: 'textactioncolumn', width: 80, actionsSeparator: ' ', items: this.actions });

        //Create a new config object containing our computed properties
        // *plus* whatever was in the config parameter.
        config = Ext.apply({
            columns: cols
        }, config);


        Application.components.ProcedureGridColumns.superclass.constructor.call(this, config);
    },

    getExpanderTemplate: function(record){
        return new Ext.XTemplate(
          '<table width="95%" cellspacing="0" cellpadding="0" border="0" class="cleanbackground"><tr>' +
          '<td width="30">&nbsp;</td>' +
          '<td width="80" style="text-indent: 10px;"><b>Позиция {unit_pos}: </b></td>' +
          '<td>{name}</td>' +
          '<td width="300"><b>Цена за единицу: </b>{price}</td>' +
          '<td width="300"><b>Количество: </b>{quantity}</td>' +
          '<td width="300" style="text-align:right;padding-left:5px"><b>Итого по позиции: </b>{current_year_price}</td>' +
          '</tr></table>');
    },

    getExpander: function () {
        var actions = this.actions;
        var cmp = this;
        return new Ext.ux.grid.RowExpander({
            createExpandingRowPanelItems: function (grid, store, record, rowIndex) {
                var items = [];
                var d, l, link, title, j, action_tpls = [];
                var expander_template = cmp.getExpanderTemplate(record);
                for (j = 0; j < actions.length; j++) {
                    if (actions[j].lotHref) {
                        action_tpls.push(new Ext.Template(actions[j].lotHref));
                    } else {
                        action_tpls.push(null);
                    }
                }
                if (record.data.lots.length > 0) {
                    for (var unit_n = 0; unit_n < record.data.lots[0]['units'].length; unit_n++) {
                        l = record.data.lots[0]['units'][unit_n];
                        d = Ext.apply({}, l);
                        d.actions = [];
                        d.currency_name = record.data.currency_name;
                        d.unit_pos = unit_n + NO_MAGIC_NUMBER_ONE;

                        d.status = Application.models.Procedure.statusRenderer(l.status, null, record, unit_n);
                        d.price = cmp.currencyRenderer(d.price, null, record);
                        d.current_year_price = cmp.currencyRenderer(d.current_year_price, null, record);
                        d.actionHandlers = [];
                        d.actionIds = [];
                        d.actions = [];
                        for (j = 0; j < actions.length; j++) {
                            if (!actions[j].lotDepends || typeof actions[j].isHiddenInLot == 'function' && actions[j].isHiddenInLot(record, l)) {
                                continue;
                            }
                            if (!actions[j].lotHref) {
                                d.actionHandlers.push(actions[j]);
                                var act_id = Ext.id();
                                d.actionIds.push(act_id);
                                d.actions.push('<a href="javascript:;"><img src="' + actions[j].icon + '" ext:qtip="' + actions[j].tooltip + '" id="' + act_id + '"/></a>');
                            } else {
                                l.lot_id = l.id;
                                if (actions[j].NoIcon) {
                                    d.actions.push('<a href="' + href_to(action_tpls[j].apply(l)) + '"><img src="/ico/message2.png" ext:qtip="' + actions[j].tooltip + '" /></a>');
                                }
                                else {
                                    d.actions.push('<a href="' + href_to(action_tpls[j].apply(l)) + '"><img src="' + actions[j].icon + '" ext:qtip="' + actions[j].tooltip + '" /></a>');
                                }
                            }
                        }

                        d.actions = d.actions.join(' ');
                        (function (l, unit_n) {
                            items.push({
                                xtype: 'panel',
                                border: false,
                                frame: false,
                                //anchor: '100%',
                                autoHeight: true,
                                //monitorResize: true,
                                cls: 'grid-lot-item x-color-' + l.status,
                                bodyCssClass: 'spaced-panel cleanbackground',
                                html: expander_template.apply(d),
                                data: d,
                                listeners: {
                                    afterrender: function (cmp) {
                                        for (var i = 0; i < cmp.data.actionHandlers.length; i++) {
                                            Ext.get(cmp.data.actionIds[i]).on('click', (function (action) {
                                                return function () {
                                                    action.handler(grid, rowIndex, 0, null, null, unit_n);
                                                }
                                            })(cmp.data.actionHandlers[i]));
                                        }
                                    }
                                }
                            });
                        })(l, unit_n);
                    }
                }
                action_tpls = null;
                return items;
            },
            hideable: false,
            hideExpander: function (record) {
                return !record.data.lots.length || record.data.lots.length && !record.data.lots[0]['units'].length;
            }
        });
    },

    regNumRenderer: function (v, m, r) {
        if (r.data['private']) {
            //return '<img src="/images/icons/silk/lock.png" ext:qtip="Закрытая процедура" alt="Закрытая процедура" /> <u>'+v+'</u>';
            return '<span class="private-procedure" ext:qtip="Закрытая процедура" alt="Закрытая процедура">' + v + '</span>';
        }
        return v;
    },

    procTypeRenderer: function (v, m, r) {
        var t = Application.models.Procedure.getType(v);
        var images = {
            '1': '/ico/procedures/bidding_up_auctions.png',
            '2': '/ico/procedures/bidding_down_auctions.png',
            '3': '/ico/procedures/contests.png',
            '4': '/ico/procedures/rate_requests.png',
            '10': '/ico/procedures/one.png',
            '32': '/ico/procedures/konkurent.png',
            '33': '/ico/procedures/konkurent.png',
            '5': '/ico/chart.png',
            '6': '/ico/all.png',
            '17': '/ico/status0.png'
        };
        var name = t ? t.name : '';
        if (r.data['private']) {
            name += ' (закрытая процедура)';
        }
        return '<img src="' + (images['' + v] ? images['' + v] : '/ico/auction.png') +
            '" ext:qtip="' + name + '" alt="' + name + '" />';
    },

    ApplicsCountRenderer: function (v, m, r) {
        if (r.data['applics_count']) {
            return r.data['applics_count'];
        } else {
            return "0";
        }
    },

    dateRenderer: function (v, m, rec, n, f) {
        v = parseDate(v);
        if (!v) {
            return '—';
        }


        var updatecheck_rows =  ['date_end_registration', 'date_begin_auction'];
        //console.log(this.updatecheck_rows);
        //var updatecheck_rows = updatecheck_rows? updatecheck_rows : this.updatecheck_rows;
        var r;
        if (f && updatecheck_rows.indexOf(f) < 0) {
            r = Ext.util.Format.date(v, 'd.m.Y');
        } else {
            r = Ext.util.Format.date(v, 'd.m.Y H:i');
        }

        if (f && updatecheck_rows.indexOf(f) >= 0) {
            var now = new Date();
            var status = 2;
            if (rec && undefined !== n) {
                status = rec.data.lots[n].status;
            }
            if (v > now && status != 10 && status != 8) {
                r += '<br/>\nОсталось ' + Ext.util.Format.interval(v - now, {langCase: 'nominative', isMs: true, lowPrecision: true});
            }
            if (rec && undefined !== n && f) {
                rec.data.lots[n][f + '_rendered'] = r;
            }
        }
        return r;
    },

    currencyRenderer: function (value, meta, record) {
        var c = false;
        if (!value) {
            return '—';
        }
        if (record.data.currency_name) {
            c = record.data.currency_name;
            if (record.data.currency_description) {
                c = '<span ext:qtip="' + record.data.currency_description + '">' + c + '</span>';
            }
        }
        return Ext.util.Format.formatPrice(value) + (c ? (' ' + c) : '');
    },

    customersRenderer: function (v, m, r, l) {
        return v;
    }

});

