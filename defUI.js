/**
 * @author xinsong
 */
a5
a7
a8
a9
;(function ($, undefinedasf) {
    $.defWidg = function (name, obj) {
        var nameSpace = name.split('-')[0],
            name = name.split('-')[1];
        namespace('$-' + nameSpace);
        $[nameSpace][name] = function (v, option) {
            if ($.type(v) == 'string' && obj.publicBridge) {
                obj.publicBridge(v, option);
            } else {
                this.elem = v;
                this.nameSpace = nameSpace;
                this.name = name;
                $.extend(this.option, option || {});
                this._draw ? this._draw() : this._init();
            }
        };
        function namespace() {
            var space;
            $.each(arguments, function (i, v) {
                space = false;
                $.each(v.split('-'), function (h, k) {
                    space = space ? (space[k] ? space[k] : (space[k] = {})) : (k == '$' ? $ : window[k] = {});
                });
            });
        }
        $[nameSpace][name].prototype = $.extend(new $.defWidgetCommon(), obj);
        $[nameSpace][name].prototype.constructor = $[nameSpace][name];
        $.fn[name] = function (option, arg) {
            if ($.type(option) == 'string') {
                var instance = this.data(name);
                return instance.bridge(option, arg);
            } else {
                return $.each(this, function (i, v) {
                    $(this).data(name, new $[nameSpace][name](v, option));
                });
            }
        };
    };
    $.defWidgetCommon = function () {
        this.init();
    };
    $.defWidgetCommon.prototype = {
        constructor: $.defWidgetCommon,
        init: $.noop
    };
})(jQuery);
(function ($, undefined) {
    $.defWidget('def-defAjax', {
        option: {
            
        },
        _init: function () {
            
        },
        ajaxSetup: function () {
            
        },
        ajaxExtend: function () {
            var flatOption = $.ajaxSettings.flatOption || {};
        }
    })
})(jQuery);
;(function ($, undefined) {
    $.defWidget('def-defPage', {
        option: {
            items: 0,
            itemsPerPage: 1,
            displayEntriesNum: 10,
            edgeEntriesNum: 1,
            preText: '上一页',
            nextText: '下一页',
            isPreShow: true,
            isNextShow: true,
            ellipseText: '...',
            callback: $.noop
        },
        _draw: function () {
            
        }
    });
})(jQuery);
;(function ($, undefined) {
    $.defWidget('def-defValidate', {
        option: {
            rules: {},
            onfocusout: true,
            onclick: true,
            onkeyup: true
        },
        _init: function () {
            this._preDispatch(false);
            this.bindSubmit();
        },
        bindSubmit: function () {
            var form = this.elem
                , that = this;
            if (form.nodeName.toLowerCase() != 'form') {
                form = form.parents('form')[0];
            }
            $(form).submit(function () {
                that._preDispatch(true);
                if (that.isError) {
                    return false;
                }
            })
        },
        _preDispatch: function (isSubmit) {
            var that = this;
            $.each(this.option.rules, function (i, v) {
                that._dispatch(i, v, false, isSubmit);
            });
            $.each(this.classRules, function (i, v) {
                that._dispatch(i, v, true, isSubmit);
            });
        },
        _dispatch: function (i, v, isClass, isSubmit) {
            var that = this;
            $.each(v, function (g, h) {
                if (g in that.methods) {
                    if (h) {
                        if (!isClass) {
                            that.prepareError(g, $('[name=' + i + ']'), that.methods[g], h, false, isSubmit);
                        } else {
                            that.prepareError(g, $('.' + i), that.methods[g], h, true, isSubmit);
                        }
                    }
                }
            });
        },
        prepareError: function (type, elem, method, param, isClass, isSubmit) {
            var errorText = $.isFunction(this.errorMessage[type]) ? this.errorMessage[type].call(this)(param) : this.errorMessage[type]
                , error
                , that = this;
            $.each(elem, function (i, elem) {
                elem = $(elem);
                if (!elem.data('defError')) {
                    elem.data('defError', {});
                }
                elem.data('defError')[type] = elem.data('defError')[type] || {};
                elem.data('defError')[type].placement = elem.data('defError')[type].placement || $('<label for="' + type + '"></label>').text(errorText);
                elem.data('defError')[type].param = elem.data('defError')[type].param || param;
                error = elem.data('defError')[type].palecment;
                that.bindValid(type, elem, isClass, isSubmit);
            });
        },
        bindValid: function (errorType, elem, isClass, isSubmit) {
            var isError
                , isRight
                , param = elem.data('defError')[errorType].param
                , error = elem.data('defError')[errorType].palcement;
            if (!isSubmit) {
                if (elem[0].nodeName.toLowerCase() == 'input') {
                    if (this.option.onkeyup) {
                        this.bindEvents(errorType, elem, isClass, 'keyup');
                    }
                    if (this.option.onfocusout) {
                        this.bindEvents(errorType, elem, isClass, 'blur');
                    }
                    if (this.option.onclick) {
                        this.bindEvents(errorType, elem, isClass, 'click');
                    }
                }
                if (elem[0].nodeName.toLowerCase() == 'select') {
                    this.bindEvents(errorType, elem, isClass, 'change');
                }
            } else {
                isRight = this.methods[errorType](elem.val(), elem, param);
                if (isRight == 'pending') {
                    isError = true;
                } else {
                    if (!isRight) {
                        this.isError = true;
                    }
                    this.showError(errorType, elem, isRight);
                }
            }
        },
        bindEvents: function (errorType, elem, isClass, event) {
            var that = this
                , handler = function () {
                    var isRight = that.methods[errorType]($(this).val(), elem, elem.data('defError')[errorType].param);
                    if (isRight == 'pending') {
                        return false;
                    }
                    that.showError(errorType, $(this) ,isRight);
                };
            isClass ? elem.live(event, handler) : elem.bind(event, handler);
        },
        showError: function (errorType, elem, isRight) {
            var error = elem.data('defError')[errorType].placement,
                param = elem.data('defError')[errorType].param,
                that = this;
            if (!isRight) {
                if (!error.parents('body').length) {
                    that.errorPlacement(error, elem, param);
                } else {
                    error.show();
                }
            } else {
                if (error.parents('body').length) {
                    error.hide();
                }
            }
        },
        format: function (error) {
            return function (param) {
                if (!$.isArray(param)) {
                    param = param.toString().split('');
                }
                $.each(param, function (i, v) {
                    error = error.replace(new RegExp("\\{" + i + "\\}", "g"), v);
                });
                return error;
            }
        },
        errorPlacement: function (error, element, param) {
            var pos = element.offset()
                , width = element.nextAll(".ico-ser").length * 120
                , wrap = $("<div style='position:absolute;color:red' class='ico-ser'>")
                , adjustAdd = 0;;
            element.after(wrap.append(error));
            if (wrap.offsetParent().is(document.body)) {
                wrap.css({
                    top : pos.top + 3,
                    left : pos.left + element.width() + width + adjustAdd
                });
            } else {
                wrap.css({
                    top : pos.top + 3 - wrap.offsetParent().offset().top,
                    left : pos.left + element.width() + width
                            - wrap.offsetParent().offset().left + adjustAdd
                });
            }
        },
        errorMessage: {
            required: '不能为空',
            number: '必须为数字 ',
            minLength: function() {
                return this.format('请输入最少{0}个字符')
            },
            maxLength: function() {
                return this.format('请输入最多{0}个字符')
            },
            range: function(){
                return this.format('请输入{0}-{1}个字符')
            },
            email: '请输入邮箱地址',
            digits: '必须为整数'
        },
        methods: {
            required: function (value, elem, param) {
                return value ? true : false;
            },
            number: function (value, elem, param) {
                return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
            },
            minLength: function (value, elem, param) {
                return value.length >= param;
            },
            maxLength: function (value, elem, param) {
                return value.length <= param;
            },
            range: function (value, elem, param) {
                return value.length >= param[0] && value.length <= param[1];
            },
            email: function (value, elem, param) {
                return /^([a-z\d]+)([\._a-z\d-]+)?@([A-Za-z0-9-])+(\.[A-Za-z0-9-]+)*((\.[A-Za-z]{2,})|(\.[A-Za-z]{2,}\.[A-Za-z]{2,}))$/.test(value);
            },
            digits: function (value, elem, param) {
                return /^\d+$/.test(value);
            }
        },
        publicBridge: function (type, param) {
            var that = this;
            switch (type) {
                case 'addMethod':
                    $.each(param, function (i, v) {
                        that.methods[i] = v[0];
                        that.errorMessage[i] = v[1];
                    });
                    break;
                case 'addClassRules':
                    $.each(param, function (i, v) {
                        that.classRules[i] = v;
                    });
            }
        },
        bridge: function (option, arg) {
            var that = this;
            switch (option) {
                case 'valid':
                    that._preDispatch(true);
                    if (that.isError) {
                        return false;
                    } else {
                        return true;
                    }
                    break;
                case 'error':
                    $.each(arg, function (i, v) {
                        $.each(v, function (g, h) {
                            that.showError(h, $('[name=' + i + ']'), false);
                            that.isError = true;
                        });
                    });
                    break;
                case 'right':
                    $.each(arg, function (i, v) {
                        $.each(v, function (g, h) {
                            that.showError(h, $('[name=' + i + ']'), true);
                            that.isError = false;
                        });
                    });
                    break;
            }
        },
        classRules: {}
    });
})(jQuery);
;(function ($, undefined) {
    $.defWidget('def-defTree', {
        option: {
            
        },
        _draw: function () {
            
        }
    });
})(jQuery);
;(function ($, undefined) {
    $.defWidget('def-defAutoComplete', {
        option: {
            url: '/interface/getAlbumFromNameJson.action',
            multipleSelect: false,
            minLength: 2,
            max: 0,
            extraParam: {},
            done: $.noop
        },
        _draw: function () {
            var suggestWrap = $('<div class="def-suggest-wrap" style="display:none;position:absolute;border:1px solid #dddddd;width:' + $(this.elem).width() + 'px;"></div>').appendTo(document.body),
                suggestUl = $('<ul class="def-suggest-ul" style="max-height:250px;overflow:auto;list-style:none;padding:0;margin:0;"></ul>').appendTo(suggestWrap),
                suggestOpt, suggestOptAll, suggestOptOther, suggestOptDone,
                btnTmp = '<span style="display:inline-block;height:20px;padding:0 5px 0 5px;border:1px solid #dddddd;color:white;cursor:pointer;line-height:20px;margin-right:10px;margin-top:5px;margin-bottom:5px;background-color:#0055a2;"></span>';
            this.suggest = {
                wrap: suggestWrap,
                ul: suggestUl
            }
            if (this.option.multipleSelect) {
                this.suggest.opt = suggestOpt = $('<div class="def-suggest-opt" style="text-align:right;"></div>').prependTo(suggestWrap);
                this.suggest.optAll = suggestOptAll = $(btnTmp).text('全选').appendTo(suggestOpt);
                this.suggest.optOther = suggestOptOther = $(btnTmp).text('反选').appendTo(suggestOpt);
                this.suggest.optDone = suggestOptDone = $(btnTmp).text('确定').appendTo(suggestOpt);
                this.suggest.optClose = suggestOptClose = $(btnTmp).text('关闭').appendTo(suggestOpt);
            }
            this._init();
            this.bindEvents();
        },
        _init: function () {
            var offset = $(this.elem).offset();
            this.suggest.wrap.css({
                top: offset.top + $(this.elem).height() + 6,
                left: offset.left
            });
        },
        refresh: function () {
            this.suggest.ul.find('input').prop('checked', false).trigger('change');
        },
        bridge: function (option, arg) {
            switch (option) {
                case 'refresh':
                    this.refresh();
                    break;
                case 'remove':
                    this._remove(arg);
                    break;
            }
        },
        _remove: function (id) {
            if (id in this.selectList) {
                delete this.selectList[id];
                $.each(this.suggest.ul.find('a'), function () {
                    if ($(this).data('source').key == id) {
                        $(this).prev().prop('checked', false).trigger('change');
                    }
                });
            }
        },
        bindEvents: function () {
            var val, that = this, activeMove, ul = this.suggest.ul;
            $(this.elem).keyup(function (e) {
                if (e.keyCode != 40 && e.keyCode != 38 && e.keyCode != 13) {
                    val = $(this).val();
                    if (val.length >= that.option.minLength) {
                        if (that.option.source) {
                            that.option.source.call(that.elem, val, that.fillList)
                        } else {
                            that.request(val);
                        }
                        that.suggest.wrap.show();
                    } else {
                        that.suggest.wrap.hide();
                    }
                }
            });
            ul.delegate('li', 'mouseover', function (e) {
                if (!activeMove) {
                    ul.find('li.select-li').removeClass('select-li').css('background-color', '#fff');
                    $(this).addClass('select-li');
                    $(ul).find('li.select-li').css('background-color', '#eee');
                }
            }).delegate('a', 'click', function (e) {
                var input = $(this).prev();
                input.prop('checked') ? input.prop('checked', false) :input.prop('checked', true);
                input.triggerHandler('change');
            }).mousemove(function () {
                activeMove = false;
            });
            this.suggest.optAll.click(function () {
                if ($(this).text() == '全选') {
                    $(this).text('全不选');
                    ul.find('input').prop('checked', true).trigger('change');
                } else {
                    $(this).text('全选');
                    ul.find('input').prop('checked', false).trigger('change');
                }
            });
            this.suggest.optOther.click(function () {
                var checked;
                checked = ul.find('input:checked').prop('checked', false).trigger('change');
                ul.find('input:not(:checked)').not(checked).prop('checked', true).trigger('change');
            });
            this.suggest.optDone.click(function () {
                that.option.done.call(that.elem, that.selectList);
            });
            this.suggest.optClose.click(function () {
                that.suggest.wrap.hide();
            })
            $(document).keydown(function (e) {
                var index, li, input;
                if (that.suggest.wrap.is(':visible')) {
                    li = ul.find('li.select-li');
                    if (li.length) {
                        index = li.index();
                    } else {
                        index = -1;
                    }
                    switch (e.keyCode) {
                        case 40:
                            if (index < ul.find('li').length - 1) {
                                index == -1 || ul.find('li').eq(index).css('background-color', '#fff').removeClass('select-li');
                                ul.find('li').eq(index += 1).css('background-color', '#eee').addClass('select-li');
                                activeMove = true;
                                if (index > 7) {
                                    ul.scrollTop(index * 30);
                                }
                            }
                            return false;
                        case 38:
                            if (index > 0) {
                                ul.find('li').eq(index).css('background-color', '#fff').removeClass('select-li');
                                ul.find('li').eq(index -= 1).css('background-color', '#eee').addClass('select-li');
                                activeMove = true;
                                ul.scrollTop(index * 30);
                            }
                            return false
                        case 13:
                            input = ul.find('li.select-li').find('input');
                            input.prop('checked') ? input.prop('checked', false) : input.prop('checked', true);
                            input.trigger('change');
                            break;
                    }
                }
            });
        },
        selectList: {},
        request: function (data) {
            var that = this;
            $.ajax({
                url: this.option.url,
                data: $.extend({
                    q: data,
                    limit: this.option.max
                }, this.option.extraParam),
                success: function (ret) {
                    that.fillList(eval('(' + ret + ')'));
                }
            });
        },
        fillList: function (data) {
            var liTmp = '<li class="def-suggest-li" style="overflow:hidden;white-space:nowrap;height:30px;line-height:30px;border-top:1px solid #eee;"></li>'
                , that = this
                , li
                , input;
            that.suggest.ul.empty();
            $.each(data, function (i, v) {
                that.suggest.ul.append(
                    li = $(liTmp)
                        .append($('<a href="javascript:void(0)" style="vertical-align:middle;"></a>')
                            .data('source', {
                                key: v.value.id,
                                value: v.data
                            }).text(v.data)).attr('title', v.data)
                );
                if (that.option.multipleSelect) {
                    li.prepend(input = $('<input type="checkbox" style="vertical-align:middle;margin:0 5px 0 5px;"/>'));
                    input.change(function (e) {
                        var link = $(this).next();
                        if ($(this).prop('checked')) {
                            that.selectList[link.data('source').key] = link.data('source');
                        } else if (link.data('source').key in that.selectList){
                            delete that.selectList[link.data('source').key];
                        }
                    });
                    if (v.value.id in that.selectList) {
                        input.prop('checked', true);
                    }
                }
            });
        }
    });
})(jQuery);
;(function ($, undefined) {
    $.defWidget('def-defSelect', {
        option: {
            height: 120,
            selectList: [
                {
                    source: function (request, response) {
                        $.ajax({
                            url: '/area/listarea.json',
                            data: {
                                areaType: request.key
                            },
                            success: function (ret) {
                                response($.parseJSON(ret));
                            }
                        });
                    },
                    initData: {
                        key: 4
                    },
                    width: 90
                },
                {
                    url: 'http://localhost:8080/area/listarea.json',
                    source: function (request, response) {
                        $.ajax({
                            url: '/area/listarea.json',
                            data: {
                                areaType: 1,
                                pcode: request.key
                            },
                            success: function (ret) {
                                response($.parseJSON(ret));
                            }
                        });
                    },
                    width: 90
                }
            ]
        },
        _draw: function () {
            var selectTmp = '<div class="def-select-wrap" style="margin-left:10px;float:left;overflow:auto;border:1px solid #dddddd;height:' + this.option.height + ';"></div>'
                , chooseDelete = $('<div class="def-select-chooseDelete" style="float:left;border:0"><table style="text-align:center;font-size:12px;height:' + this.option.height + ';width:50px;"></table></div>')
                , choose = $('<tr><td><a href="javascript:void(0)" style="color:blue;">选择</a></td></tr>')
                , deleteOp = $('<tr><td><a href="javascript:void(0)" style="color:blue;">删除</a></td></tr>')
                , result = $('<div class="def-select-result" style="float:left;overflow:auto;border:1px solid #dddddd;height:' + this.option.height + ';width:100px;"></div>')
                , selectList = []
                , that = this;
            $.each(this.option.selectList, function (i, v) {
                selectList[i] = $(selectTmp).css('width',v.width).data('source', v).appendTo($(that.elem));
                if (v.initData) {
                    that._fillSelectList(selectList[i], v, v.initData);
                }
            });
            $(this.elem).append(chooseDelete.find('table').append(choose).append(deleteOp).end());
            $(this.elem).append(result.data('source', {}));
            this.selectList = selectList;
            this.operate = {
                choose: choose,
                deleteOp: deleteOp,
                result: result
            };
            this.bindEvents();
        },
        _fillSelectList: function (list, v, data) {
            var selectOpt = '<div class="def-select-option" style="text-align:center;"></div>',
                selectOptLink = '<a href="javascript:void(0)" style="color:#838383;"></a>';
            v.source.call(list.empty(), data, fill);
            function fill(dataList) {
                $.each(dataList, function (i, h) {
                    list.append($(selectOpt).append($(selectOptLink).text(h.value).attr('key', h.key)).attr('key', h.key));
                });
            }
        },
        bindEvents: function () {
            var that = this, $that, result = that.operate.result, key, data, parent;
            this.operate.choose.find('a').click(function () {
                $.each(that.selectList[that.selectList.length - 1].find('div.select-result'), function (i, v) {
                    if (!((key = $(v).attr('key')) in (data = result.data('source')))) {
                        result.append($(v).clone().css('background-color', '#ffffff').removeClass('select-result'));
                        data[key] = {
                            key: key,
                            value: $(v).text()
                        };
                    }
                });
            });
            this.operate.deleteOp.find('a').click(function () {
                $.each(result.find('div.delete-result'), function (i, v) {
                    delete result.data('source')[$(v).remove().attr('key')];
                });
            });
            this.operate.result.delegate('a', 'click', function (e) {
                parent = $(this).parent();
                if (parent.hasClass('delete-result')) {
                    parent.removeClass('delete-result').css('background-color', '#fff');
                } else {
                    parent.addClass('delete-result').css('background-color', '#3399FF');
                }
            });
            $.each(this.selectList, function (i, v) {
                if (i !== that.selectList.length - 1) {
                    $that = this;
                    $(this).delegate('a', 'click', function (e) {
                        that._fillSelectList($($that).next(), $($that).next().data('source'), {
                            key: $(this).attr('key')
                        });
                    });
                } else {
                    $(this).delegate('a', 'click dblclick', function (e) {
                        parent = $(this).parent();
                        if (parent.hasClass('select-result')) {
                            parent.removeClass('select-result').css('background-color', '#fff');
                        } else {
                            parent.addClass('select-result').css('background-color', '#3399FF');
                        }
                        if (e.type == 'dblclick') {
                            if (!((key = $(v).attr('key')) in (data = result.data('source')))) {
                                result.append(parent.clone().css('background-color', '#ffffff').removeClass('select-result'));
                                data[key] = 1;
                            }
                        }
                    });
                }
            });
        }
    });
})(jQuery);
;(function ($, undefined) {
    $.defWidget('def-defDialog', {
        option: {
            autoOpen: true,
            closeOnEscape: true,
            draggable: true,
            height: 'auto',
            modal: true,
            position: 'center',
            resizable: true,
            title: 'defDialog',
            width: 'auto',
            dialogClass: '',
            zIndex: 1000
        },
        bridge: function (option, arg) {
            switch (option) {
                case 'open':
                    this._open();
                    break;
                case 'close':
                    this._close();
                    break;
                case 'option':
                    if (!arg) {
                        return $.extend({}, this.option);
                    } else if ($.type(arg) == 'object') {
                        this.setOptions();
                    }
                    break;
            }
        },
        setOptions: function () {
            var that = this;
            $.each(arg, function (i, v) {
                switch (i) {
                    case 'title':
                        that.dialog.titleText.text(v);
                        break;
                    case 'draggable':
                        if (v === false) {
                            that.destroy('drag');
                        } else if (v === true) {
                            that.drag();
                        }
                        break;
                    case 'dialogClass':
                        that.dialog.wrap.addClass(v);
                        break;
                }
            });
        },
        _draw: function () {
            var dialogWrap = $('<div class="def-dialog-wrap ' + this.option.dialogClass + '" style="width:' + this.option.width + ';height:' + this.option.height + ';overflow:hidden;position:absolute;display:none;border:2px solid #dddddd;font-size:1em;"></div>'),
                dialogTitleText = $('<div style="float:left;color:#fff;font-weight:bold;font-size:1.2em;line-height:30px;">' + this.option.title + '</div>'),
                dialogTitleClose = $('<div style="cursor:pointer;float:right;color:#fff;font-weight:bold;font-size:14px;height:14px;width:14px;border:1px solid #fff;margin-top:7px;">×</div>'),
                dialogTitle = $('<div class="def-dialog-title" style="padding:0 5px 0 5px;height:30px;background-color:#0055a2;"></div>').append(dialogTitleText).append(dialogTitleClose).appendTo(dialogWrap),
                dialogContent = $('<div class="def-dialog-content" style="overflow:auto;"></div>').append($(this.elem).show()).appendTo(dialogWrap),
                dialogBtnWrap = $('<div class="def-dialog-btn" style="border-top:1px solid #dddddd;height:50px;padding-right:10px;"></div>'),
                mask = $('<div style="display:none;background-color:#fff;left:0;top:0;position:absolute;opacity:0.7;filter:alpha(opacity = 50)"></div>'),
                dialog = {
                    wrap: dialogWrap,
                    title: dialogTitle,
                    titleText: dialogTitleText,
                    content: dialogContent,
                    dialogBtnWrap: dialogBtnWrap,
                    mask: mask,
                    close: dialogTitleClose,
                    btn: dialogBtnWrap,
                    width: function () {
                        return this.wrap.width();
                    },
                    height: function () {
                        return this.wrap.height();
                    }
                },
                resizeHandle = {
                    topLine: '<div style="height:7px;position:absolute;z-index:999"></div>',
                    leftLine: '<div style="width:7px;position:absolute;z-index:999"></div>',
                    point: '<div style="height:9px;width:9px;position:absolute;z-index:999"></div>'
                };
            this.dialog = dialog;
            this.resizeTmp = resizeHandle;
            this._init();
        },
        _creatBtn: function () {
            var btnWrap = $('<div style="float:right;"></div>'),that = this,
                btn = '<span style="display:inline-block;height:30px;padding:0 5px 0 5px;border:1px solid #dddddd;color:white;cursor:pointer;line-height:30px;margin-right:10px;margin-top:10px;background-color:#0055a2;"></span>';
            $.each(this.option.buttons, function (i, v) {
                btnWrap.append(
                    $(btn)
                        .text(i)
                        .click(function () {
                            v.call(that.elem);
                        })
                );
            });
            this.dialog.btn.appendTo(this.dialog.wrap).append(btnWrap);
        },
        _init: function () {
            if (this.option.modal) {
                $(document.body).append(this.dialog.mask.css({
                    height: $(document).height(),
                    width: $(document).width()
                }));
            }
            $(document.body).append(this.dialog.wrap);
            if (this.option.autoOpen) {
                this._open();
            }
            if ($.type(this.option.buttons) == 'object') {
                this._creatBtn();
            }
            this.position();
            this.bindEvents();
        },
        _open: function () {
            this.dialog.wrap.add(this.dialog.mask).show();
            if ($.type(this.option.open) == 'function') {
                this.option.open.call(this.elem);
            }
        },
        close: function () {
            this.dialog.wrap.add(this.dialog.mask).hide();
            if ($.type(this.option.close) == 'function') {
                this.option.close.call(this.elem);
            }
        },
        position: function () {
            var dialog = this.dialog;
            if (this.option.position == 'center') {
                dialog.wrap.css({
                    top: $(window).scrollTop() + $(window).height() / 2 - dialog.height()/2,
                    left: $(window).width() / 2 - dialog.width()/2
                });
            }
        },
        bindEvents: function () {
            var dialog = this.dialog;
            dialog.close.click(function () {
                dialog.wrap.add(dialog.mask).hide();
            });
            if (this.option.draggable) {
                this.drag();
            }
            if (this.option.resizable) {
                this._resize_init();
            }
        },
        drag: function () {
            var move, target_left, target_top, dialog = this.dialog; 
            this.dialog.title.bind('mousedown.defDrag', function (ev) {
                var offset = dialog.title.offset();
                target_left = Math.round(Math.abs(ev.pageX - offset.left));
                target_top = Math.round(Math.abs(ev.pageY - offset.top));
                move = true;
            }).css('cursor', 'move');
            $(document).bind('mousemove.defDrag', function (e) {
                if (move) {
                    dialog.wrap.css({
                        top: e.pageY - target_top,
                        left: e.pageX - target_left
                    });
                }
            }).bind('mouseup.defDrag', function () {
                move = false;
            }); 
            
        },
        destroy: function (name) {
            if (name == 'drag') {
                $(document).unbind('mousemove.defDrag mouseup.defDrag');
                this.dialog.title.unbind('mousedown.defDrag').css('cursor', 'auto');
            }
        },
        _resize_init: function () {
            var resizeOpt = {
                n: {
                    point: 'n-resize',
                    tl: true,
                    lr: false,
                    tb: true
                },
                s: {
                    point: 'n-resize',
                    tl: false,
                    lr: false,
                    tb: true
                },
                w: {
                    point: 'w-resize',
                    tl: true,
                    lr: true,
                    tb: false
                },
                e: {
                    point: 'w-resize',
                    tl: false,
                    lr: true,
                    tb: false
                },
                nw: {
                    point: 'nw-resize',
                    tl: true,
                    lr: true,
                    tb: true
                },
                ne: {
                    point: 'ne-resize',
                    tl: true,
                    lr: true,
                    tb: true
                },
                sw: {
                    point: 'ne-resize',
                    tl: true,
                    lr: true,
                    tb: true
                },
                se: {
                    point: 'nw-resize',
                    tl: false,
                    lr: true,
                    tb: true
                }
            },
            that = this;
            $.each(resizeOpt, function (i, v) {
                that.resize(i, v);
            });
        },
        resize: function (pos, direct) {
            var dialog = this.dialog,
                elem;
            switch (pos) {
                case 'n': 
                    elem = $(this.resizeTmp.topLine).css({
                        cursor: direct.point,
                        top: 0,
                        left: 9,
                        width: dialog.width() - 18
                    });
                    this.dialog.top = elem;
                    break;
                case 's':
                    elem = $(this.resizeTmp.topLine).css({
                        cursor: direct.point,
                        bottom: 0,
                        right: 9,
                        width: dialog.width() - 18
                    });
                    this.dialog.bottom = elem;
                    break;
                case 'w':
                    elem = $(this.resizeTmp.leftLine).css({
                        cursor: direct.point,
                        top: 9,
                        left: 0,
                        height: dialog.height() - 18
                    });
                    this.dialog.left = elem;
                    break;
                case 'e':
                    elem = $(this.resizeTmp.leftLine).css({
                        cursor: direct.point,
                        bottom: 9,
                        right: 0,
                        height: dialog.height() - 18
                    });
                    this.dialog.right = elem;
                    break;
                case 'nw':
                    elem = $(this.resizeTmp.point).css({
                        cursor: direct.point,
                        top: 0,
                        left: 0
                    });
                    break;
                case 'ne':
                    elem = $(this.resizeTmp.point).css({
                        cursor: direct.point,
                        top: 0,
                        right: 0
                    });
                    break;
                case 'sw':
                    elem = $(this.resizeTmp.point).css({
                        cursor: direct.point,
                        bottom: 0,
                        left: 0
                    });
                    break;
                case 'se':
                    elem = $(this.resizeTmp.point).css({
                        cursor: direct.point,
                        bottom: 0,
                        right: 0
                    });
                    break;
            }
            dialog.wrap.append(elem);
            this._resize_event(elem, $.extend(direct, {direct: pos}));
        },
        _resize_event: function (elem, direct) {
            var move, pos, point, dialog = this.dialog, offset;
            elem.mousedown(function (e) {
                move = true;
                offset = dialog.wrap.offset();
                pos = {
                    top: e.pageY,
                    left: e.pageX
                };
            });
            $(document).mousemove(function (e) {
                var len;
                if (move && direct.lr) {
                    if (direct.tl) {
                        len = pos.left - e.pageX;
                        if (direct.direct != 'ne') {
                            dialog.wrap.css({
                                left: e.pageX
                            });
                        } else {
                            len = e.pageX - pos.left;
                        }
                    } else {
                        len = e.pageX - pos.left;
                    }
                    dialog.wrap.width('+=' + len);
                    dialog.content.width('+=' + len);
                    dialog.top.add(dialog.bottom).width(dialog.width()-18);
                    pos.left = e.pageX;
                }
                if (move && direct.tb) {
                    if (direct.tl) {
                        len = pos.top - e.pageY;
                        if (direct.direct != 'sw') {
                            dialog.wrap.css({
                                top: e.pageY
                            });
                        } else {
                            len = e.pageY - pos.top;
                        }
                    } else {
                        len = e.pageY - pos.top;
                    }
                    dialog.wrap.height('+=' + len);
                    dialog.content.height('+=' + len);
                    dialog.left.add(dialog.right).height(dialog.height()-18);
                    pos.top = e.pageY;
                }
            }).mouseup(function (e) {
                move = false;
            });
        }
    });
})(jQuery);