/**
 * 維基百科{{link style}}修復工具 ver: 0.5
 *
 * Original Author: [[User:逆襲的天邪鬼]]
 *
 * Maintainer: [[User:Gaolezhe]]
 *
 * 該工具會在{{link style}}模板下面顯示個按鈕，或者在「編輯」模式頁面最底下添一個「修復link style」按鈕。
 *
 * 查看已知bug或報告bug：見[[User talk:逆襲的天邪鬼/fixlinkstyle.js]]
 *
 * 更新日誌：
 * 0.1（2016-10-14）：修復部分連結有中文但未找到的bug；加入一些細節，例如查看差異、突出顯示文內的跨語言連結。
 * 0.2（2016-10-15）：能夠直接修改上下文。
 * 0.3（2016-10-16）：修復bug
 * 0.4（2016-11-06）：加入簡體中文界面，並处理[[Special:Permalink/42067088]]
 * 0.5（2017-03-06）：修復一些小bug
 *
 * WHAT SHOULD I DO IF I HAD AN EGGPAIN:
 * 1. 重寫 article.scanInterLinks()
 */

(function($, mw) {
    'use strict';

    mw.loader.using('jquery.ui');

    var UI;
    // 照顧一下看不懂繁體字的簡體字用戶
    switch (mw.config.get('wgUserLanguage')) {
        case 'zh-cn':
        case 'zh-hans':
        case 'zh-my':
        case 'zh-sg':
            UI = {
                CLEARBUTTON: '清理',
                CLEARBUTTON2: '清理{{link style}}',
                TITLE: '维基百科{{link style}}修复工具',
                LOADING: '正在加载...',
                CHECKINGTITLE: '正在检查是否存在同名条目...',
                TRANSLATING: '正在尝试搜索对应中文条目...',
                FOUND: '找到$1个跨语言链接',
                NETWORKERROR: '网络错误',
                TITLELINKSCLEAN: '本工具用于处理<a href="https://zh.wikipedia.org/wiki/WP:MOSIW" target="_blank">跨语言链接</a>和章节标题上的链接，摘掉条目的{{<a href="https://zh.wikipedia.org/wiki/Template:Link_style" target="_blank">link style</a>}}模板。<br><br>本文在章节标题处有$1个链接，它们将被无条件清除：<br>',
                OLDTITLE: '旧标题',
                NEWTITLE: '新标题',
                TITLELINKSCLEAN2: '<br>注意，如果希望对这些标题进行其他修改，请在点击“下一步”之后点击“查看差异”进行校对和修正。<br>',
                NEXT: '下一步',
                WELCOME: '<div style="padding: 12px;margin-bottom: 10px;background-color: #d9edf7;border-color: #bce8f1;color: #31708f;">现有大量不正确的跨语言链接（绿链）需要修复，欢迎协助处理：<a href="https://zh.wikipedia.org/wiki/User:Cewbot/需要修正的跨語言連結" target="_blank">User:Cewbot/需要修正的跨語言連結</a></div>本工具用于处理<a href="https://zh.wikipedia.org/wiki/WP:MOSIW" target="_blank">跨语言链接</a>和章节标题上的链接，摘掉条目的{{<a href="https://zh.wikipedia.org/wiki/Template:Link_style" target="_blank">link style</a>}}模板。<span style="color:red;">在清理过程中请认真检查上下文！</span><br><br>请选择各跨语言链接的处理方法：',
                NONE: '没有发现跨语言链接。这通常可能是：<br>① 跨语言链接已被清理，但没有去掉{{link style}}模板；<br>② 条目中没有跨语言链接，但条目中所用的模板有。可以通过检查文章中被高亮的部分来确认；<br><br>',
                LINK: '链接',
                CHINESEARTICLE: '对应中文条目：',
                CHINESETEST2: '注意同名中文条目：',
                CHINESETEST: '搜索中文维基条目：',
                QUICKSEARCH: '按回车键搜索中文维基',
                GOOGLEIT: 'Google搜索“原名+‘中文’”',
                GOOGLEIT2: 'Google搜索在维基中的原条目',
                MISSING: '外文维基百科无此条目',
                PAGENOTFOUND: '页面未找到',
                GOOGLETRANSLATE: 'Google翻译',
                GOOGLELANG: 'zh-CN',
                ACTION: '处理',
                DONTMODIFY: '不修改',
                REMOVELINK: '去除链接',
                ORIGINALNAME: '原名',
                ARTICLENAME: '条目名',
                LANGUAGE: '语言',
                DISPLAYTEXT: '显示文本',
                REPLACETO: '替换成',
                WIKICODE: '维基代码',
                CHINESE: '中文',
                REPLACECONTEXT: '查看/修改上下文',
                QUICKREPLACE: '<strong>快速替换：</strong>',
                SHOWDIFF: '显示更改',
                SUBMIT: '直接保存',
                BUGREPORT: '<a href="https://zh.wikipedia.org/wiki/User_talk:逆襲的天邪鬼/fixlinkstyle.js" target="_blank" style="display:inline-block;float:right;"><small>提出意见/报告Bug</small></a>',
                SAVING: '正在保存...',
                PAGENOTCHANGED: '无法更改页面',
                SUCCESS: '成功',
                WARNING: '警告：在您决定提交之前，请您认真检查上下文是否正确，并且您需要主动承担编辑错误的后果（如果程序正常的话）。建议先点击“显示更改”以检查变更。是否决定直接提交？',
                SUMMARY: '[[User:逆襲的天邪鬼/fixlinkstyle.js|改用]]{{Link Style}}：共$1个跨语言链接',
                SUMMARY2: '[[User:逆襲的天邪鬼/fixlinkstyle.js|清理]]$1个跨语言链接',
                AND: '和',
                UNDO: '撤销',
                TITLELINKS: '$1个标题链接'
            };
            break;
        default:
            UI = {
                CLEARBUTTON: '清理',
                CLEARBUTTON2: '清理{{link style}}',
                TITLE: '維基百科{{link style}}修復工具',
                LOADING: '正在加載...',
                CHECKINGTITLE: '正在檢查是否存在同名條目...',
                TRANSLATING: '正在嘗試搜尋對應中文條目...',
                FOUND: '找到$1個跨語言連結',
                NETWORKERROR: '網路錯誤',
                TITLELINKSCLEAN: '本工具用於處理<a href="https://zh.wikipedia.org/wiki/WP:MOSIW" target="_blank">跨語言連結</a>和章節標題上的連結，摘掉條目的{{<a href="https://zh.wikipedia.org/wiki/Template:Link_style" target="_blank">link style</a>}}模板。<br><br>本文在章節標題處有$1個連結，它們將被無條件清除：<br>',
                OLDTITLE: '舊標題',
                NEWTITLE: '新標題',
                TITLELINKSCLEAN2: '<br>注意，如果希望對這些標題進行其他修改，請在點擊「下一步」之後點擊「查看差異」進行校對和修正。<br>',
                NEXT: '下一步',
                WELCOME: '<div style="padding: 12px;margin-bottom: 10px;background-color: #d9edf7;border-color: #bce8f1;color: #31708f;">現有大量不正確的跨語言連結（綠連）需要修復，歡迎協助處理：<a href="https://zh.wikipedia.org/wiki/User:Cewbot/需要修正的跨語言連結" target="_blank">User:Cewbot/需要修正的跨語言連結</a></div>本工具用於處理<a href="https://zh.wikipedia.org/wiki/WP:MOSIW" target="_blank">跨語言連結</a>和章節標題上的連結，摘掉條目的{{<a href="https://zh.wikipedia.org/wiki/Template:Link_style" target="_blank">link style</a>}}模板。<span style="color:red;">在清理過程中請認真檢查上下文！</span><br><br>請選擇各跨語言連結的處理方法：',
                NONE: '沒有發現跨語言連結。這通常可能是：<br>① 跨語言連結已被清理，但沒有去掉{{link style}}模板；<br>② 條目中沒有跨語言連結，但條目中所用的模板有。可以通過檢查文章中被突顯的部分來確認；<br><br>',
                LINK: '連結',
                CHINESEARTICLE: '對應中文條目：',
                CHINESETEST2: '注意同名中文條目：',
                CHINESETEST: '檢索中文維基條目：',
                QUICKSEARCH: '按Enter搜尋中文維基',
                GOOGLEIT: 'Google搜尋「原名+『中文』」',
                GOOGLEIT2: 'Google搜尋在維基內的原條目',
                MISSING: '外文維基百科無此條目',
                PAGENOTFOUND: '頁面未找到',
                GOOGLETRANSLATE: 'Google翻譯',
                GOOGLELANG: 'zh-TW',
                ACTION: '處理',
                DONTMODIFY: '不修改',
                REMOVELINK: '去除連結',
                ORIGINALNAME: '原名',
                ARTICLENAME: '條目名',
                LANGUAGE: '語言',
                DISPLAYTEXT: '顯示文本',
                REPLACETO: '替換成',
                WIKICODE: '維基原始碼',
                CHINESE: '中文',
                REPLACECONTEXT: '檢視/修改上下文',
                QUICKREPLACE: '<strong>快速替換：</strong>',
                SHOWDIFF: '檢視差異',
                SUBMIT: '直接储存',
                BUGREPORT: '<a href="https://zh.wikipedia.org/wiki/User_talk:逆襲的天邪鬼/fixlinkstyle.js" target="_blank" style="display:inline-block;float:right;"><small>提出意見/報告Bug</small></a>',
                SAVING: '正在储存...',
                PAGENOTCHANGED: '無法更改頁面',
                SUCCESS: '成功',
                WARNING: '警告：在您決定提交之前，請您認真檢查上下文是否正確，並且您需要主動承擔編輯錯誤的後果（如果程式正常的話）。建議先點擊「查看差異」以檢查變更。是否決定直接提交？',
                SUMMARY: '[[User:逆襲的天邪鬼/fixlinkstyle.js|改用]]{{Link Style}}模板：共$1個跨語言連結',
                SUMMARY2: '[[User:逆襲的天邪鬼/fixlinkstyle.js|清理]]$1個跨語言連結',
                AND: '和',
                UNDO: '還原',
                TITLELINKS: '$1個標題連結'
            };
    }

    // 各種語言
    var LANGUAGES = {
'aa':'aa','ab':'ab','ace':'ace','ady':'ady','af':'af','ak':'ak','als':'als','am':'am','an':'an','ang':'ang','ar':'ar','arc':'arc','arz':'arz','as':'as','ast':'ast','av':'av','ay':'ay','az':'az','azb':'azb','ba':'ba','bar':'bar','bat-smg':'bat-smg','bcl':'bcl','be':'be','be-tarask':'be-x-old','be-x-old':'be-x-old','bg':'bg','bh':'bh','bi':'bi','bjn':'bjn','bm':'bm','bn':'bn','bo':'bo','bpy':'bpy','br':'br','bs':'bs','bug':'bug','bxr':'bxr','ca':'ca','cbk-zam':'cbk-zam','cdo':'cdo','ce':'ce','ceb':'ceb','ch':'ch','cho':'cho','chr':'chr','chy':'chy','ckb':'ckb','co':'co','cr':'cr','crh':'crh','cs':'cs','csb':'csb','cu':'cu','cv':'cv','cy':'cy','da':'da','de':'de','diq':'diq','dsb':'dsb','dv':'dv','dz':'dz','ee':'ee','egl':'eml','el':'el','eml':'eml','en':'en','eo':'eo','es':'es','et':'et','eu':'eu','ext':'ext','fa':'fa','ff':'ff','fi':'fi','fiu-vro':'fiu-vro','fj':'fj','fo':'fo','fr':'fr','frp':'frp','frr':'frr','fur':'fur','fy':'fy','ga':'ga','gag':'gag','gan':'gan','gd':'gd','gl':'gl','glk':'glk','gn':'gn','gom':'gom','got':'got','gsw':'als','gu':'gu','gv':'gv','ha':'ha','hak':'hak','haw':'haw','he':'he','hi':'hi','hif':'hif','ho':'ho','hr':'hr','hsb':'hsb','ht':'ht','hu':'hu','hy':'hy','hz':'hz','ia':'ia','id':'id','ie':'ie','ig':'ig','ii':'ii','ik':'ik','ilo':'ilo','io':'io','is':'is','it':'it','iu':'iu','ja':'ja','jam':'jam','jbo':'jbo','jv':'jv','ka':'ka','kaa':'kaa','kab':'kab','kbd':'kbd','kg':'kg','ki':'ki','kj':'kj','kk':'kk','kl':'kl','km':'km','kn':'kn','ko':'ko','koi':'koi','kr':'kr','krc':'krc','ks':'ks','ksh':'ksh','ku':'ku','kv':'kv','kw':'kw','ky':'ky','la':'la','lad':'lad','lb':'lb','lbe':'lbe','lez':'lez','lg':'lg','li':'li','lij':'lij','lmo':'lmo','ln':'ln','lo':'lo','lrc':'lrc','lt':'lt','ltg':'ltg','lv':'lv','lzh':'zh-classical','mai':'mai','map-bms':'map-bms','mdf':'mdf','mg':'mg','mh':'mh','mhr':'mhr','mi':'mi','min':'min','mk':'mk','ml':'ml','mn':'mn','mo':'mo','mr':'mr','mrj':'mrj','ms':'ms','mt':'mt','mus':'mus','mwl':'mwl','my':'my','myv':'myv','mzn':'mzn','na':'na','nah':'nah','nan':'zh-min-nan','nap':'nap','nb':'no','nds':'nds','nds-nl':'nds-nl','ne':'ne','new':'new','ng':'ng','nl':'nl','nn':'nn','no':'no','nov':'nov','nrm':'nrm','nso':'nso','nv':'nv','ny':'ny','oc':'oc','olo':'olo','om':'om','or':'or','os':'os','pa':'pa','pag':'pag','pam':'pam','pap':'pap','pcd':'pcd','pdc':'pdc','pfl':'pfl','pi':'pi','pih':'pih','pl':'pl','pms':'pms','pnb':'pnb','pnt':'pnt','ps':'ps','pt':'pt','qu':'qu','rm':'rm','rmy':'rmy','rn':'rn','ro':'ro','roa-rup':'roa-rup','roa-tara':'roa-tara','ru':'ru','rue':'rue','rup':'roa-rup','rw':'rw','sa':'sa','sah':'sah','sc':'sc','scn':'scn','sco':'sco','sd':'sd','se':'se','sg':'sg','sgs':'bat-smg','sh':'sh','si':'si','simple':'simple','sk':'sk','sl':'sl','sm':'sm','sn':'sn','so':'so','sq':'sq','sr':'sr','srn':'srn','ss':'ss','st':'st','stq':'stq','su':'su','sv':'sv','sw':'sw','szl':'szl','ta':'ta','tcy':'tcy','te':'te','tet':'tet','tg':'tg','th':'th','ti':'ti','tk':'tk','tl':'tl','tn':'tn','to':'to','tpi':'tpi','tr':'tr','ts':'ts','tt':'tt','tum':'tum','tw':'tw','ty':'ty','tyv':'tyv','udm':'udm','ug':'ug','uk':'uk','ur':'ur','uz':'uz','ve':'ve','vec':'vec','vep':'vep','vi':'vi','vls':'vls','vo':'vo','vro':'fiu-vro','wa':'wa','war':'war','wo':'wo','wuu':'wuu','xal':'xal','xh':'xh','xmf':'xmf','yi':'yi','yo':'yo','yue':'zh-yue','za':'za','zea':'zea','zh':'zh','zh-classical':'zh-classical','zh-cn':'zh','zh-min-nan':'zh-min-nan','zh-tw':'zh','zh-yue':'zh-yue','zu':'zu'
    };
    // 修復不正確的語言代碼
    var BADLANGS = {
        'jp': 'ja',
        'zh': ''
    };
    // 不要處理裡面的連結
    // 注意：目前只處理IGNOREAREA[0]，如果需要添加，那麼需要修改article.scaninnerlink中的相關部分。
    var IGNOREAREA = [
        /{{\s*(expand language|request translation|translation request|transexpan|請求翻譯|请求翻译|翻译请求|翻譯請求|求翻譯|求翻译|需要翻譯|需要翻译).*?}}/gi
    ];
    // 檢視上下文時的「快速替換」
    var QUICKREPLACES = [
        {
            search: /([“‘「『《〈]?)\[\[([^\[\]]*?)\]\]([”’」』》〉]?)（\[\[:([^\[\]]*?):([^\[\]]*?)\]\](）?)/,
            schemas: [
                {
                    name: '[[中文]]',
                    replace: function (text) {
                        return text.replace(/([“‘「『《〈]?)\[\[([^\[\]]*?)\]\]([”’」』》〉]?)（\[\[:([^\[\]]*?):([^\[\]]*?)\]\](）?)/, function (match, p1, p2, p3, p4, p5, p6) {
                            return p1 + '[[' + p2 + ']]' + p3;
                        });
                    }
                },
                {
                    name: '[[中文]]（{{lang|xx|外文}}）',
                    replace: function (text) {
                        return text.replace(/([“‘「『《〈]?)\[\[([^\[\]]*?)\]\]([”’」』》〉]?)（\[\[:([^\[\]]*?):([^\[\]]*?)\]\](）?)/, function (match, p1, p2, p3, p4, p5, p6) {
                            var p5s = p5.split('|');
                            var p5t = p5s.length>1 ? p5s[1] : p5s[0];
                            return p1 + '[[' + p2 + ']]' + p3 + '（{{lang|' + p4 + '|' + p5t + '}}' + p6;
                        });
                    }
                },
                {
                    name: '[[中文]]（外文）',
                    replace: function (text) {
                        return text.replace(/([“‘「『《〈]?)\[\[([^\[\]]*?)\]\]([”’」』》〉]?)（\[\[:([^\[\]]*?):([^\[\]]*?)\]\](）?)/, function (match, p1, p2, p3, p4, p5, p6) {
                            var p5s = p5.split('|');
                            var p5t = p5s.length>1 ? p5s[1] : p5s[0];
                            return p1 + '[[' + p2 + ']]' + p3 + '（' + p5t + p6;
                        });
                    }
                },
                {
                    name: '{{tsl|xx|外文|中文}}',
                    replace: function (text) {
                        return text.replace(/([“‘「『《〈]?)\[\[([^\[\]]*?)\]\]([”’」』》〉]?)（\[\[:([^\[\]]*?):([^\[\]]*?)\]\](）?)/, function (match, p1, p2, p3, p4, p5, p6) {
                            return p1 + '{{tsl|' + p4 + '|' + p5.split('|')[0] + '|' + p2 + '}}' + p3;
                        });
                    }
                },
                {
                    name: '{{link-xx|中文|外文}}',
                    replace: function (text) {
                        return text.replace(/([“‘「『《〈]?)\[\[([^\[\]]*?)\]\]([”’」』》〉]?)（\[\[:([^\[\]]*?):([^\[\]]*?)\]\](）?)/, function (match, p1, p2, p3, p4, p5, p6) {
                            var p2s = p2.split('|');
                            var p2a = p2s[0];
                            var p2b = p2s.length>1 ? ('|' + p2s[1]) : '';
                            return p1 + '{{link-' + p4 + '|' + p2a + '|' + p5.split('|')[0] + p2b + '}}' + p3;
                        });
                    }
                }
            ]
        },
        {
            search: /\[\[:([^\[\]]*?):([^\[\]]*?)\|([^\[\]]*?)\]\]/,
            schemas: [
                {
                    name: '{{tsl|xx|外文|中文}}',
                    replace: function (text) {
                        return text.replace(/\[\[:([^\[\]]*?):([^\[\]]*?)\|([^\[\]]*?)\]\]/, function (match, p1, p2, p3) {
                            return '{{tsl|' + p1 + '|' + p2 + '|' + p3 + '}}';
                        });
                    }
                },
                {
                    name: '{{link-xx|中文|外文}}',
                    replace: function (text) {
                        return text.replace(/\[\[:([^\[\]]*?):([^\[\]]*?)\|([^\[\]]*?)\]\]/, function (match, p1, p2, p3) {
                            return '{{link-' + p1 + '|' + p3 + '|' + p2 + '}}';
                        });
                    }
                },
                {
                    name: '[[中文]]（外文）',
                    replace: function (text) {
                        return text.replace(/\[\[:([^\[\]]*?):([^\[\]]*?)\|([^\[\]]*?)\]\]/, function (match, p1, p2, p3) {
                            return '[[' + p3 + ']]（' + p2 + '）';
                        });
                    }
                },
                {
                    name: '[[中文]]（{{lang|xx|外文}}）',
                    replace: function (text) {
                        return text.replace(/\[\[:([^\[\]]*?):([^\[\]]*?)\|([^\[\]]*?)\]\]/, function (match, p1, p2, p3) {
                            return '[[' + p3 + ']]（{{lang|' + p1 + '|' + p2 + '}}）';
                        });
                    }
                },
                {
                    name: '中文（外文）',
                    replace: function (text) {
                        return text.replace(/\[\[:([^\[\]]*?):([^\[\]]*?)\|([^\[\]]*?)\]\]/, function (match, p1, p2, p3) {
                            return p3 + '（' + p2 + '）';
                        });
                    }
                },
                {
                    name: '中文（{{lang|xx|外文}}）',
                    replace: function (text) {
                        return text.replace(/\[\[:([^\[\]]*?):([^\[\]]*?)\|([^\[\]]*?)\]\]/, function (match, p1, p2, p3) {
                            return p3 + '（{{lang|' + p1 + '|' + p2 + '}}）';
                        });
                    }
                }
            ]
        }
    ];



    /*
     * 借助維基百科API讀寫內容
     */
    var wiki = {
        loadPage: function (pageName, success, failure) {
            $.ajax({
                url: mw.util.wikiScript('api'),
                data: {
                    action: 'query',
                    prop: 'revisions',
                    rvprop: 'content',
                    titles: pageName,
                    redirects: true,
                    format: 'json'
                },
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    if (data.query) {
                        // var r = {};
                        var pages = data.query.pages;
                        for (var pageid in pages) {
                            var page = pages[pageid];
                            if (!('missing' in page)) {
                                // r[page.title] = page.revisions[0]['*'];
                                if (typeof success === 'function') {
                                    success(page.revisions[0]['*']);
                                    return;
                                }
                            }
                        }
                        /*
                        if (typeof success === 'function') {
                            success(r);
                        }
                        */
                    }

                    if (typeof failure === 'function') {
                        failure(UI.PAGENOTFOUND);
                    }
                },
                error: function (xhr) {
                    if (typeof failure === 'function') {
                        failure(UI.NETWORKERROR);
                    }
                }
            });
        },
        savePage: function (title, content, summary, success, failure) {
            // 保存頁面
            // 該編輯會被標記為小編輯
            $.ajax({
                url: mw.util.wikiScript('api'),
                data: {
                    format: 'json',
                    action: 'edit',
                    title: title,
                    summary: summary,
                    minor: true,
                    text: content,
                    token: mw.user.tokens.get('csrfToken')
                },
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    if (data && data.edit && data.edit.result === 'Success') {
                        if (typeof success === 'function') {
                            success();
                        }
                    } else {
                        if (typeof failure === 'function') {
                            failure(UI.PAGENOTCHANGED);
                        }
                    }
                },
                error: function (xhr) {
                    if (typeof failure === 'function') {
                        failure(UI.NETWORKERROR);
                    }
                }
            });
        },
        translateTitle: function (titles, fromLang, toLang, transTable, success) {
            $.ajax({
                url: 'https://' + LANGUAGES[fromLang] + '.wikipedia.org/w/api.php',
                data: {
                    action: 'query',
                    prop: 'langlinks',
                    lllang: toLang,
                    format: 'json',
                    redirects: true,
                    lllimit: 50,
                    titles: titles
                },
                dataType: 'jsonp',
                type: 'POST',
                success: function (data) {
                    if (data.query) {
                        // 獲取原來的標題
                        var orinTitle = {};
                        var convert = function (arr) {
                            if (arr) {
                                for (var i=0; i<arr.length; i++) {
                                    if (orinTitle[arr[i].from]) {
                                        orinTitle[arr[i].to] = orinTitle[arr[i].from];
                                    } else {
                                        orinTitle[arr[i].to] = arr[i].from;
                                    }
                                }
                            }
                        };
                        convert(data.query.normalized);
                        convert(data.query.redirects);

                        // 標明翻譯情況
                        var pages = data.query.pages;
                        for (var pageid in pages) {
                            var page = pages[pageid];
                            var title = page.title;
                            if (orinTitle[title]) {
                                title = orinTitle[title];
                            }

                            if (page.missing !== undefined) {
                                transTable[fromLang + ':' + title] = null;
                            } else if (page.langlinks) {
                                transTable[fromLang + ':' + title] = page.langlinks[0]['*'];
                            }
                        }
                    }
                    if (typeof success === 'function') {
                        success();
                    }
                }
            });
        },
        checkTitle: function (titles, checkTable, success, failure) {
            $.ajax({
                url: mw.util.wikiScript('api'),
                data: {
                    action: 'query',
                    format: 'json',
                    redirects: true,
                    titles: titles
                },
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    if (data.query) {
                        // 獲取原來的標題
                        var orinTitle = {};
                        var convert = function (arr) {
                            if (arr) {
                                for (var i=0; i<arr.length; i++) {
                                    if (orinTitle[arr[i].from]) {
                                        orinTitle[arr[i].to] = orinTitle[arr[i].from];
                                    } else {
                                        orinTitle[arr[i].to] = arr[i].from;
                                    }
                                }
                            }
                        };
                        convert(data.query.normalized);
                        convert(data.query.redirects);

                        // 標明翻譯情況
                        var pages = data.query.pages;
                        for (var pageid in pages) {
                            var page = pages[pageid];
                            var title = page.title;
                            if (orinTitle[title]) {
                                title = orinTitle[title];
                            }

                            if (page.pageid) {
                                checkTable[title] = true;
                            }
                        }
                    }
                    if (typeof success === 'function') {
                        success();
                    }
                },
                error: function (xhr) {
                    if (typeof failure === 'function') {
                        failure(UI.NETWORKERROR);
                    }
                }
            });
        }
    };



    /*
     * 對條目內容進行處理
     */
    var article = {
        title: '',
        content: '',
        interlinks: [],
        _segments: [],
        scanInterLinks: function() {
            // TODO 重寫，改成逐字分析的版本。
            var i;

            // 將文章內容按照 \n 和連結分解成若干塊（分段），並記錄各跨語言連結都位於哪個塊之中。
            // 在連結修改完成之後，再按照維基百科格式將其轉換為維基代碼，並將所有分塊合併成一個字符串。
            this._segments = [];
            this._linkpos = [];
            this.interlinks = [];

            var segments = this._segments;
            var linkpos = this._linkpos;
            var interlinks = this.interlinks;

            // 將文字按 \n 分割
            var splitLines = function (str) {
                var seq = str.split('\n');

                for (i=0; i<seq.length-1; i++) {
                    segments.push(seq[i]);
                    segments.push('\n');
                }
                segments.push(seq[seq.length-1]);
            };

            var text = this.content;

            // 忽略一些模板
            // 由於只忽略一個模板所以暫時不用for
            //var ignorearea = [];
            var ignorearea = {from: -1000, to: -1000};
            var match;
            var re;
            //for (i=0; i<IGNOREAREA.length; i++) {
            //    var re = IGNOREAREA[i];
                re = IGNOREAREA[0];
                re.lastIndex = 0;

                while ((match = re.exec(text)) !== null) {
                    //ignorearea.push({from: re.lastIndex, to: re.lastIndex + match[0].length});
                    ignorearea = {from: re.lastIndex - match[0].length, to: re.lastIndex};
                }
            //}

            // 正式開始分析
            re = /\[\[:([^\[\]]*?)\]\]/g;
            var extract = /(.*?):(.*)/;
            var lastPos = 0;
            while ((match = re.exec(text)) !== null) {
                // 檢查是否要忽略
                //for (i=0; i<ignorearea.length; i++) {
                    //if (re.lastIndex >= ignorearea[i].from && re.lastIndex <= ignorearea[i].to) {
                    if (re.lastIndex >= ignorearea.from && re.lastIndex <= ignorearea.to) {
                        continue;
                    }
                //}

                // 將outertext以\n劃塊
                splitLines(text.substring(lastPos, re.lastIndex-match[0].length));

                // 將跨語言連結放入分段之中。因為合併時會重新生成文字，所以它只起佔位作用。
                segments.push(match[0]);
                lastPos = re.lastIndex;

                // 分析跨語言連結中的元素：語言、條目名、顯示文字
                // 忽略不存在的語言代碼並糾正錯誤的語言代碼
                var match2 = extract.exec(match[1]);
                var lang = null;
                if (match2 !== null && match2[1]) {
                    lang = match2[1].toLowerCase();
                    if (BADLANGS[lang]) {
                        lang = BADLANGS[lang];
                    }
                    if (!LANGUAGES[lang]) {
                        lang = null;
                    }
                }

                // 如果確實是跨語言連結則加入到連結列表中
                if (lang !== null) {
                    var link = {
                        type: 'link',
                        lang: lang,
                        original: match[0],
                        index: this._segments.length - 1    // 記錄連結在「分段」中的位置，便於合併
                    };
                    var sepPos = match2[2].indexOf('|');

                    if (sepPos === -1) {
                        link.target = match2[2];
                        link.text = '';
                    } else {
                        link.target = match2[2].substring(0, sepPos);
                        link.text = match2[2].substring(sepPos+1);
                    }

                    // 把「_」換成空白
                    link.target = link.target.replace(/_/g, ' ');

                    interlinks.push(link);
                }
            }

            // 處理結尾的文字
            splitLines(text.substring(lastPos));

            // 找到各連結的上下文
            for (i=0; i<interlinks.length; i++) {
                var ilink = interlinks[i];

                // 上文不能碰到上個link
                var pos1 = 0;
                if (i>0) {
                    pos1 = interlinks[i-1].context.to + 1;
                }

                var p = interlinks[i].index;
                while (p >= 0 && segments[p] !== '\n') {
                    p--;
                }
                p++;

                var from = pos1>p ? pos1 : p;

                // 下文不能碰到下個link
                pos1 = segments.length;
                if (i < interlinks.length-1) {
                    pos1 = interlinks[i+1].index - 1;
                }

                p = interlinks[i].index;
                while (p < segments.length && segments[p] !== '\n') {
                    p++;
                }
                p--;

                var to = pos1<p ? pos1 : p;

                ilink.context = {from: from, to: to};
            }
        },
        getContext: function (linkid) {
            // 獲取上下文
            var pos = article.interlinks[linkid].context;
            return article._segments.slice(pos.from, pos.to+1).join('');
        },
        setContext: function (linkid, text) {
            // 設置上下文。為防止混亂，設置時不改變分段個數：將涉及到的分段合併到link身上，然後用空字符串代替其他分段。
            var link = article.interlinks[linkid];
            var pos = link.context;
            link.type = 'plain';
            link.text = text;
            article._segments.fill('', pos.from, pos.to+1);
        },


        toString: function () {
            // 合併文字
            var segments = this._segments;
            var links = this.interlinks;

            for (var i=0; i<links.length; i++) {
                var r;
                var link = links[i];

                switch (link.type) {
                    case 'link':
                        r = ['[['];
                        if (link.lang && link.lang.length > 0) {
                            r.push(':', link.lang, ':');
                        }
                        r.push(link.target);
                        if (link.text && link.text.length > 0) {
                            if (link.target && link.target.length > 0) {
                                r.push('|');
                            }
                            r.push(link.text);
                        }
                        r.push(']]');
                        break;
                    case 'tsl':
                        r = ['{{tsl|', link.lang, '|', link.source, '|', link.target];
                        if (link.text && link.text.length > 0) {
                            r.push('|', link.text);
                        }
                        r.push('}}');
                        break;
                    case 'ilh':
                        r = ['{{link-', link.lang, '|', link.target, '|', link.source];
                        if (link.text && link.text.length > 0) {
                            r.push('|', link.text);
                        }
                        r.push('}}');
                        break;
                    case 'plain':
                        r = [link.text];
                        break;
                }

                segments[link.index] = r.join('');
            }

            return segments.join('');
        },
        update: function () {
            this.content = this.toString();
        },


        translateTitle: function (callback) {
            var transTable = {};
            var counter = 0;
            var queue = {};
            var queue2 = [];
            var i;
            var links = article.interlinks;

            // 根據語言整理隊列
            for (i = 0; i<links.length; i++) {
                var link = links[i];
                if (!queue[link.lang]) {
                    queue[link.lang] = [];
                }
                queue[link.lang].push(link.target);
            }
            // 以50個標題為一組進行分割（API限制）
            // 計算需要執行的次數，次數為0之後整理結果，並執行callback
            for (var lang in queue) {
                var len = queue[lang].length;
                var l2 = parseInt((len+50)/50);
                counter += l2;

                for (var j = 0; j<l2; j++) {
                    queue2.push({
                        lang: lang,
                        titles: queue[lang].slice(50*j, 50*(j+1)).join('|')
                    });
                }
            }

            var stop = false;
            // 整理翻譯結果
            var tide = function () {
                for (i=0; i<links.length; i++) {
                    var link = links[i];
                    var key = link.lang + ':' + link.target;
                    if (transTable[key] === null) {
                        link.missing = true;
                    } else if (transTable[key]) {
                        link.translation = transTable[key];
                    }
                }
            };

            // 由於JSONP不會觸發請求失敗事件，因此認為超時就是出錯
            var errorTimer = [];
            // 正確獲取到一組信息。如果所有信息都獲取到說明結束
            var proc = function () {
                if (stop) {
                    return;
                }
                counter--;
                clearTimeout(errorTimer.shift());
                if (counter <= 0) {
                    stop = true;
                    tide();

                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            };
            // 發生錯誤，直接結束翻譯
            var error = function () {
                if (stop) {
                    return;
                }
                stop = true;
                tide();
                if (typeof callback === 'function') {
                    callback();
                }
            };

            // 開始翻譯標題
            if (queue2.length > 0) {
                for (i = 0; i<queue2.length; i++) {
                    if (stop) {
                        break;
                    }
                    errorTimer.push(setTimeout(error, 2000));
                    wiki.translateTitle(queue2[i].titles, queue2[i].lang, 'zh', transTable, proc);
                }
            } else {
                proc();
            }
        },

        titleCheckTable: {},

        checkTitle: function (callback) {
            // 檢查中文維基百科是否有同標題而主題不同的條目
            article.titleCheckTable = {};
            var counter = 0;
            var queue = {};
            var queue2 = [];
            var i;
            var links = article.interlinks;

            // 整理所有標題
            for (i = 0; i<links.length; i++) {
                var link = links[i];
                queue[link.target] = true;
                queue[link.text] = true;
            }
            queue[''] = undefined;

            for (var title in queue) {
                queue2.push(title);
            }

            // 以50個為一組進行查詢
            queue = [];
            counter = parseInt((queue2.length+50)/50);

            for (i=0; i<counter; i++) {
                queue.push(queue2.slice(50*i, 50*(i+1)).join('|'));
            }

            var stop = false;
            var proc = function () {
                if (stop) {
                    return;
                }
                counter--;
                if (counter <= 0) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            };
            var error = function () {
                if (stop) {
                    return;
                }
                stop = true;
                if (typeof callback === 'function') {
                    callback();
                }
            };

            if (queue.length > 0) {
                for (i = 0; i<queue.length; i++) {
                    if (stop) {
                        break;
                    }
                    wiki.checkTitle(queue[i], article.titleCheckTable, proc, error);
                }
            } else {
                if (typeof callback === 'function') {
                    callback();
                }
            }
        },



        titlelinks: [],
        titleLinksCount: 0,

        scanTitleLinks: function () {
            // 目前會自動清理標題上的連結
            // TODO 讓用戶可以手動清理
            article.titlelinks = [];
            article.titleLinksCount = 0;

            article.content = article.content.replace(/\n *={2,5} *.*? *={2,5} */g, function (str) {
                var wrongtitle = false;
                var newtitle = str.replace(/\[\[.*?\]\]/g, function (link) {
                    if (link.toLowerCase().indexOf('file:') === 0 || link.toLowerCase().indexOf('image:') === 0 || link.indexOf('文件:') === 0 || link.indexOf('檔案:') === 0) {
                        return link;
                    }

                    wrongtitle = true;
                    article.titleLinksCount++;
                    return link.replace(/\[\[(.*?)\]\]/, '$1').replace(/:.*?:(.*)/, '$1').replace(/.*?\|(.*)/, '$1');
                });
                if (wrongtitle) {
                    article.titlelinks.push({oldtitle: str, newtitle: newtitle});
                }
                return newtitle;
            });

            return article.titleLinksCount > 0;
        },

        removeTitleLinks: function () {
            // TODO 讓用戶可以手動清理
            //article.titlelinks = 0;
            //article.content = article.content.replace(/\n *={2,5} *.*? *={2,5} */g, function (str) {
            //    return str.replace(/\[\[.*?\]\]/g, function (link) {
            //        article.titlelinks++;
            //        return link.replace(/\[\[(.*?)\]\]/, '$1').replace(/:.*?:(.*)/, '$1').replace(/.*\|(.*)/, '$1');
            //    });
            //});
        }
    };



    /*
     * UI
     */
    var jobid = 0;
    var curjobid = 0;
    var dialog = {
        // 構建界面
        createRadio: function (name, value, checked) {
            var $e = $('<input>')
                .attr('id', name + '_' + value)
                .attr('name', name)
                .attr('value', value)
                .attr('type', 'radio');
            if (checked) {
                $e.attr('checked', 'checked');
            }
            return $e;
        },
        createTextBox: function (name, value, placeholder, size) {
            return $('<input>')
                .attr('id', name)
                .attr('name', name)
                .attr('value', value)
                .attr('size', size ? size : '15')
                .attr('placeholder', placeholder ? placeholder : '');
        },
        createLink: function (text, href) {
            return $('<a>')
                .attr('href', href)
                .attr('target', '_blank')
                .html(text);
        },
        createRow: function (link, index) {
            var $row = $('<tr>');
            var $tmp;
            var translation = '';
            var name = 'ilf_' + index;
            $row.append('<td>'+(index+1)+'</td>');

            $tmp = $('<td>').append(
                dialog.createLink('<span style="color:#00af89">' + link.original + '</span>', 'https://' + LANGUAGES[link.lang] + '.wikipedia.org/wiki/' + link.target)
            );
            if (link.missing) {
                // 外文維基百科無此條目
                $tmp.append('<br><br><small style="color:red;">' + UI.MISSING + '</small>');
            }
            if (link.translation) {
                // 有中文對應條目，直接給出中文標題
                translation = link.translation;
                $tmp.append('<br><br>', $('<small style="color:green;">').append(
                                UI.CHINESEARTICLE,
                                dialog.createLink(link.translation, 'https://zh.wikipedia.org/wiki/' + link.translation)
                            ));
            } else {
                if (article.titleCheckTable[link.target]) {
                    // 中文有同名條目但主題不同，需要注意
                    $tmp.append('<br><br>', $('<small style="color:red;">').append(
                                    UI.CHINESETEST2,
                                    dialog.createLink(link.target, 'https://zh.wikipedia.org/wiki/' + link.target)
                                ));
                } else {
                    // 中文沒有對應條目和同名條目，快速檢索是否有相關話題的條目
                    $tmp.append('<br><br>', $('<small>').append(
                                    UI.CHINESETEST,
                                    dialog.createLink(link.target, 'https://zh.wikipedia.org/w/index.php?search=' + link.target)
                                ));
                }

                // 對於[[:en:A|B]]，上面一段if是A，這一段是B
                if (link.text && link.text !== link.target) {
                    if (article.titleCheckTable[link.text]) {
                        $tmp.append('<br>', $('<small style="color:red;">').append(
                                        UI.CHINESETEST2,
                                        dialog.createLink(link.text, 'https://zh.wikipedia.org/wiki/' + link.text)
                                    ));
                    } else {
                        $tmp.append('<br>', $('<small>').append(
                                        UI.CHINESETEST,
                                        dialog.createLink(link.text, 'https://zh.wikipedia.org/w/index.php?search=' + link.text)
                                    ));
                    }
                }
            }
            // 快速檢索自定義標題
            $tmp.append('<br><small>' + UI.CHINESETEST + '</small><input type="search" placeholder="' + UI.QUICKSEARCH + '" class="fixlinkstyle-quicksearch">');

            // 快速調用Google進行搜尋
            $tmp.append('<br><br>',
                        $('<small>').append(dialog.createLink(UI.GOOGLEIT, 'https://www.google.com/search?q=' + encodeURIComponent(link.target + ' ' + UI.CHINESE))),
                        '<br>',
                        $('<small>').append(dialog.createLink(UI.GOOGLEIT2, 'https://www.google.com/search?as_sitesearch=wikipedia.org&q=' + encodeURIComponent(link.target))),
                        '<br>',
                        $('<small>').append(dialog.createLink(UI.GOOGLETRANSLATE, 'https://translate.google.com/#auto/' + UI.GOOGLELANG + '/' + encodeURIComponent(link.target)))
                       );
            $row.append($tmp);

            $tmp = $('<td>').append(
                dialog.createRadio(name, '0'),
                    '<label for="' + name + '_0">' + UI.DONTMODIFY + '</label>',
                    '<br>',
                dialog.createRadio(name, '1'),
                    '<label for="' + name + '_1">' + UI.REMOVELINK + '</label>',
                    '<br>',
                dialog.createRadio(name, '2'),
                    '[[',
                    dialog.createTextBox(name+'_21', translation, UI.ARTICLENAME),
                    '|',
                    dialog.createTextBox(name+'_22', link.text === translation ? '' : link.text, UI.DISPLAYTEXT),
                    ']]',
                    '<br>',
                dialog.createRadio(name, '3'),
                    '{{tsl|',
                    dialog.createTextBox(name+'_31', link.lang, UI.LANGUAGE, '5'),
                    '|',
                    dialog.createTextBox(name+'_32', link.target, UI.ORIGINALNAME),
                    '|',
                    dialog.createTextBox(name+'_33', translation.length>0 ? translation : link.text, UI.ARTICLENAME),
                    '|',
                    dialog.createTextBox(name+'_34', (translation.length===0 || link.text===translation) ? '' : link.text, UI.DISPLAYTEXT),
                    '}}',
                    '<br>',
                dialog.createRadio(name, '4'),
                    '{{link-',
                    dialog.createTextBox(name+'_41', link.lang, UI.LANGUAGE, '5'),
                    '|',
                    dialog.createTextBox(name+'_42', translation.length>0 ? translation : link.text, UI.ARTICLENAME),
                    '|',
                    dialog.createTextBox(name+'_43', link.target, UI.ORIGINALNAME),
                    '|',
                    dialog.createTextBox(name+'_44', (translation.length===0 || link.text===translation) ? '' : link.text, UI.DISPLAYTEXT),
                    '}}',
                    '<br>',
                dialog.createRadio(name, '5'),
                    UI.REPLACETO + ': ',
                    dialog.createTextBox(name+'_51', '{{lang|' + link.lang + '|' + (link.text ? link.text : link.target) + '}}', UI.WIKICODE, '30'),
                    '<br>',
                dialog.createRadio(name, '6', true),
                    '<label for="' + name + '_6">' + UI.REPLACECONTEXT + '</label>'
            );

            $row.append($tmp);

            return $row;
        },
        createRow2: function (link, index) {
            var name = 'ilf_' + index;
            var $row = $('<tr>')
                            .attr('id', name + '_6_row');
            $row.append('<td>');

            var $tmp = $('<td>').attr('colspan', '2');
            var text = article.getContext(index);
            $tmp.append($('<textarea>')
                            .attr('id', name + '_6_t')
                            .attr('rows', '3')
                            .attr('data-link-id', index)
                            .attr('data-orintext', text)
                            .val(text)
                       );

            // 檢查能否快速替換
            var $quickReplaces = $('<div>').append($('<a href="#" class="fixlinkstyle-quickreplace-undo">' + UI.UNDO + '</a><br>')
                    .attr('data-link-id', index)
                );
            for (var i=0; i<QUICKREPLACES.length; i++) {
                var $quickReplace = $('<div id="fixlinkstyle-quickreplace-'+index+'-'+i+'">');
                var schema = QUICKREPLACES[i];
                $quickReplace.append('<br>',
                    UI.QUICKREPLACE,
                    '<span id="fixlinkstyle-quickreplace-'+index+'-'+i+'-text"></span>',
                    '<br><br>',
                    UI.REPLACETO, '：'
                );

                for (var j=0; j<schema.schemas.length; j++) {
                    $quickReplace.append($('<a href="#" class="fixlinkstyle-quickreplace-link">')
                        .text(schema.schemas[j].name)
                        .attr('data-quickreplace-id', i)
                        .attr('data-schema-id', j)
                        .attr('data-link-id', index)
                    );
                    if (j<schema.schemas.length-1) {
                        $quickReplace.append('、');
                    }
                }

                $quickReplace.append('<br>');
                $quickReplaces.append($quickReplace);

                schema.search.lastIndex = 0;
                var match = schema.search.exec(text);
                if (match === null) {
                    $quickReplace.hide();
                }
            }
            $tmp.append($quickReplaces);

            $row.append($tmp);

            return $row;
        },

        // 指定加載、儲存等操作的執行方式
        handlers: {
            api: {
                name: 'api',
                load: function (complete, error) {
                    wiki.loadPage(mw.config.get('wgPageName'), complete, error);
                },
                save: function (summary, complete, error) {
                    wiki.savePage(article.title, article.content, summary, complete, error);
                },
                warn: function () {
                    if (!localStorage.fixlinkstyle_warned) {
                        if (confirm(UI.WARNING)) {
                            localStorage.fixlinkstyle_warned = true;
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return true;
                    }
                },
                diff: function (summary) {
                    var frm = $('<form method="post" style="display:none;">')
                        .attr('action', mw.util.getUrl(mw.config.get('wgPageName'), {action: 'submit'}))
                        .attr('enctype', 'multipart/form-data')
                        .append($('<textarea name="wpTextbox1">').val(article.content),
                                $('<input name="wpSummary">').val(summary),
                                '<input name="wpMinoredit" type="checkbox" value="1" checked="checked">',
                                '<input name="format" value="text/x-wiki">',
                                '<input name="wpAutoSummary" value="hashhashhashhash">',    // 防止「未填寫摘要」的提示
                                '<input name="model" value="wikitext">',
                                '<input name="wpEditToken" value="' + mw.user.tokens.get('csrfToken') + '">',
                                '<input name="wpUltimateParam" value="1">',
                                '<input name="wpDiff" value="aa">',
                                '<input name="mode" value="text">');
                    $('body').append(frm);
                    frm.submit();
                },
                end: function () {
                    setTimeout(function () {
                        history.go(0);
                    }, 500);
                }
            },
            text: {
                name: 'text',
                load: function (complete) {
                    if (typeof complete === 'function') {
                        complete($('#wpTextbox1').val());
                    }
                },
                save: function (summary, complete) {
                    $('#wpTextbox1').val(article.content);
                    $('#wpSummary').val(summary);
                    $('#wpMinoredit').attr('checked', 'checked');

                    if (typeof complete === 'function') {
                        complete();
                    }
                },
                diff: function (summary, complete) {
                    $('#wpTextbox1').val(article.content);
                    $('#wpSummary').val(summary);
                    $('#wpMinoredit').attr('checked', 'checked');

                    $('#wpDiff').click();

                    if (typeof complete === 'function') {
                        complete();
                    }
                },
                end: function () {
                    setTimeout(function () {
                        $('#fixlinkstyle_dialog').dialog('close');
                        $('#wpTextbox1').focus();
                    }, 500);
                }
            }
        },
        handler: {},

        // 閃爍跨語言連結
        // TODO 改為CSS
        links: {
            list: null,
            border: false,
            blink: function () {
                var i;
                var links = dialog.links.list;
                dialog.links.border = !dialog.links.border;
                if (dialog.links.border) {
                    for (i=0; i<links.length; i++) {
                        links[i].style.border = '1px solid red';
                    }
                } else {
                    for (i=0; i<links.length; i++) {
                        links[i].style.border = 'none';
                    }
                }
            },
            get: function () {
                dialog.links.list = $('.extiw', '#mw-content-text').filter(function () {
                    return this.parentNode.className.indexOf('ilh-link') === -1 && this.href && this.href.indexOf('.wikipedia.org') > -1;
                });
            },
            highlight: function (value) {
                if (value && dialog.links.timerId === null) {
                    dialog.links.timerId = setInterval(dialog.links.blink, 1000);
                } else if (!value) {
                    dialog.links.border = true;
                    dialog.links.blink();
                    clearInterval(dialog.links.timerId);
                    dialog.links.timerId = null;
                }
            },
            timerId: null
        },

        // 對話框操作
        init: function () {
            if (document.getElementById('fixlinkstyle_dialog') === null) {
                $('body').append('<div id="fixlinkstyle_dialog" style="display:none;" title="' + UI.TITLE + '"></div>');
            }

            dialog.links.get();
            dialog.links.highlight(true);
            $('#fixlinkstyle_dialog').html(UI.LOADING);

            jobid++;
            curjobid = jobid;

            $('#fixlinkstyle_dialog').dialog({
                modal: false,
                close: function() {
                    dialog.links.highlight(false);
                    jobid++;
                },
                draggable: true,
                width: 700,
                height: 500,
                buttons: []
            });

            article.title = mw.config.get('wgPageName');
            dialog.handler.load(function (content) {
                if (curjobid !== jobid) {
                    return;
                }

                article.content = content;

                article.scanTitleLinks();
                article.scanInterLinks();
                $('#fixlinkstyle_dialog').append('<br>', UI.FOUND.replace('$1', article.interlinks.length), '<br>', UI.TRANSLATING);

                article.translateTitle(function () {
                    if (curjobid !== jobid) {
                        return;
                    }

                    $('#fixlinkstyle_dialog').append('<br>', UI.CHECKINGTITLE);
                    article.checkTitle(function () {
                        if (curjobid !== jobid) {
                            return;
                        }

                        if (article.titleLinksCount > 0) {
                            dialog.puttitles();
                        } else {
                            dialog.putlinks();
                        }
                    });
                });
            }, function (e) {
                if (curjobid !== jobid) {
                    return;
                }
                $('#fixlinkstyle_dialog').append('<br><span style="color:red;">' + e + '</span>');
            });
        },
        puttitles: function () {
            $('#fixlinkstyle_dialog').html(UI.TITLELINKSCLEAN.replace('$1', article.titleLinksCount));

            var $table = $('<table class="wikitable">').append('<tr><th>#</th><th>'+UI.OLDTITLE+'</th><th>'+UI.NEWTITLE+'</th></tr>');

            for (var i=0; i<article.titlelinks.length; i++) {
                $table.append($('<tr>').append(
                    '<td>' + (i+1) + '</td>',
                    $('<td>').text(article.titlelinks[i].oldtitle),
                    $('<td>').text(article.titlelinks[i].newtitle)
                ));
            }

            $('#fixlinkstyle_dialog').append(
                $table,
                UI.TITLELINKSCLEAN2,
                '<br>',
                UI.BUGREPORT
            );

            $('#fixlinkstyle_dialog').dialog('option', 'buttons', [
                {
                    text: UI.NEXT,
                    click: function() {
                        dialog.putlinks();
                    },
                },
            ]);
        },
        putlinks: function () {
            var $table = $('<table class="wikitable">').append('<tr><th>#</th><th>'+UI.LINK+'</th><th>'+UI.ACTION+'</th></tr>');

            for (var i=0; i<article.interlinks.length; i++) {
                $table.append(dialog.createRow(article.interlinks[i], i));
                $table.append(dialog.createRow2(article.interlinks[i], i));
            }

            $('#fixlinkstyle_dialog').html(UI.WELCOME);

            if (article.interlinks.length === 0) {
                $('#fixlinkstyle_dialog').append('<br><br>', UI.NONE);
            } else {
                $('#fixlinkstyle_dialog').append($('<form id="ilf_frm">').append($table));
            }

            $('#fixlinkstyle_dialog').append(
                '<br>',
                UI.BUGREPORT
            );

            // 快速檢索
            $('.fixlinkstyle-quicksearch').keyup(function (e) {
                if (e.which === 13) {
                    var frm = $('<form method="get" target="_blank" style="display:none;">')
                        .append($('<input type="text" name="search">').val(this.value))
                        .attr('action', 'https://zh.wikipedia.org/w/index.php');
                    $('body').append(frm);
                    frm.submit();
                }
            });

            // 點擊對話框上的文本框時自動選中對應的單選按鈕
            $('input:text', '#ilf_frm').click(function () {
                var name = this.name;
                var i = name.lastIndexOf('_');
                var radioname = name.slice(0, i);
                var key = name.charAt(i+1);
                document.forms.ilf_frm[radioname].value = key;
                $('#' + radioname + '_6_row').hide();
            });

            // 顯示/隱藏「檢視上下文」的文本框
            $('input:radio', '#ilf_frm').click(function () {
                var name = this.name;
                var value = this.value;
                if (value === '6') {
                    $('#' + name + '_6_row').show();
                    $('#' + name + '_6_t').change().focus();
                } else {
                    $('#' + name + '_6_row').hide();
                }
            });

            // 檢查能否快速替換
            var checkQuickReplace = function () {
                var $e = $(this);
                var text = $e.val();
                var index = $e.attr('data-link-id');

                for (var i=0; i<QUICKREPLACES.length; i++) {
                    var schema = QUICKREPLACES[i];
                    schema.search.lastIndex = 0;
                    var match = schema.search.exec(text);

                    if (match) {
                        $('#fixlinkstyle-quickreplace-'+index+'-'+i+'-text').text(match[0]);
                        $('#fixlinkstyle-quickreplace-'+index+'-'+i).slideDown();
                    } else {
                        $('#fixlinkstyle-quickreplace-'+index+'-'+i).slideUp();
                    }
                }
            };
            $('textarea', '#ilf_frm').change(checkQuickReplace).keyup(checkQuickReplace).change();

            // 執行快速替換
            $('.fixlinkstyle-quickreplace-link').click(function (e) {
                e.preventDefault();
                var $e = $(this);
                var index = $e.attr('data-link-id');
                var qrid = parseInt($e.attr('data-quickreplace-id'));
                var sid = parseInt($e.attr('data-schema-id'));
                var text = $('#ilf_' + index + '_6_t').val();

                $('#ilf_' + index + '_6_t').val(QUICKREPLACES[qrid].schemas[sid].replace(text)).change();
            });

            $('.fixlinkstyle-quickreplace-undo').click(function (e) {
                e.preventDefault();
                var $e = $(this);
                var index = $e.attr('data-link-id');
                var text = $('#ilf_' + index + '_6_t').attr('data-orintext');

                $('#ilf_' + index + '_6_t').val(text).change();
            });

            // 檢視差異和提交
            $('#fixlinkstyle_dialog').dialog('option', 'buttons', [
                {
                    text: UI.SHOWDIFF,
                    click: function() {
                        dialog.check(dialog.diff);
                    },
                },
                {
                    text: UI.SUBMIT,
                    click: function() {
                        if (!dialog.handler.warn || (dialog.handler.warn && dialog.handler.warn())) {
                            dialog.check(dialog.submit);
                        }
                    },
                },
            ]);
        },
        check: function (complete) {
            var frm = document.forms.ilf_frm;
            var links = article.interlinks;
            var oldlinkscount = links.length;

            $('#fixlinkstyle_dialog').dialog('option', 'buttons', []);

            for (var i=0; i<links.length; i++) {
                var link = links[i];
                switch (frm['ilf_' + i].value) {
                    case '0':
                        break;
                    case '1':
                        link.type = 'plain';
                        if ((!link.text) || (link.text === '')) {
                            link.text = link.target;
                        }
                        break;
                    case '2':
                        link.type = 'link';
                        link.lang = '';
                        link.target = frm['ilf_' + i + '_21'].value;
                        link.text = frm['ilf_' + i + '_22'].value;
                        break;
                    case '3':
                        link.type = 'tsl';
                        link.lang = frm['ilf_' + i + '_31'].value;
                        link.source = frm['ilf_' + i + '_32'].value;
                        link.target = frm['ilf_' + i + '_33'].value;
                        link.text = frm['ilf_' + i + '_34'].value;
                        break;
                    case '4':
                        link.type = 'ilh';
                        link.lang = frm['ilf_' + i + '_41'].value;
                        link.target = frm['ilf_' + i + '_42'].value;
                        link.source = frm['ilf_' + i + '_43'].value;
                        link.text = frm['ilf_' + i + '_44'].value;
                        break;
                    case '5':
                        link.type = 'plain';
                        link.text = frm['ilf_' + i + '_51'].value;
                        break;
                    case '6':
                        article.setContext(i, $('#ilf_' + i + '_6_t').val());
                        break;
                }
            }

            article.update();

            // 檢查是否仍有跨語言連結，如果沒有，摘掉link style模板
            article.scanInterLinks();

            var linkstyleTemplate = /{{\s*link style.*?}}\s*/i;
            var newlinkscount = article.interlinks.length;
            var summary = UI.SUMMARY2.replace('$1', oldlinkscount-newlinkscount);
            if (newlinkscount === 0 && linkstyleTemplate.test(article.content)) {
                article.content = article.content.replace(linkstyleTemplate, '');
                // 換成「摘掉模板」
                summary = UI.SUMMARY.replace('$1', oldlinkscount-newlinkscount);
            }

            if (article.titleLinksCount > 0) {
                summary = summary + UI.AND + UI.TITLELINKS.replace('$1', article.titleLinksCount);
            }

            if (typeof complete === 'function') {
                complete(summary);
            }
        },
        submit: function (summary) {
            $('#fixlinkstyle_dialog').html(UI.SAVING);
            dialog.handler.save(summary, function () {
                $('#fixlinkstyle_dialog').append('<br><span style="color:green;">'+UI.SUCCESS+'</span>');
                dialog.handler.end();
            }, function (e) {
                $('#fixlinkstyle_dialog').append('<br><span style="color:red;">'+e+'</span>');
            });
        },
        diff: function (summary) {
            $('#fixlinkstyle_dialog').html(UI.SAVING);
            dialog.handler.diff(summary, function () {
                $('#fixlinkstyle_dialog').dialog('close');
            });
        }
    };



    /*
     * 在維基百科中添加按鈕和菜單
     */
    var wgaction = mw.config.get('wgAction');

    if (!window.fixlinkstyle) {
        window.fixlinkstyle = {};
    }

    var addfixbutton = function () {
        $('#p-fixlinkstyle').remove();
        $(mw.util.addPortletLink('p-cactions', '#', UI.CLEARBUTTON2, 'p-fixlinkstyle')).click(function (e) {
            e.preventDefault();
            dialog.init();
        });

        var $ambox = $('.mbox-text-span', '.ambox-link-style');
        switch (wgaction) {
            case 'view':
                $('#fixlinkstyle').remove();

                dialog.handler = dialog.handlers.api;

                if ($ambox.length > 0) {
                    $ambox.append('<center><a id="fixlinkstyle" href="#"><span class="mw-ui-button mw-ui-progressive">' + UI.CLEARBUTTON + '</span></a></center>');
                }

                $('#fixlinkstyle').click(function () {
                    dialog.init();
                });

                break;

            case 'submit':
            case 'edit':
                $('#fixlinkstyle').remove();
                $('#fixlinkstyle_button').remove();

                dialog.handler = dialog.handlers.text;

                $ambox.append('<center><a id="fixlinkstyle" href="#"><span class="mw-ui-button mw-ui-progressive">' + UI.CLEARBUTTON + '</span></a></center>');
                $('#fixlinkstyle').click(function (e) {
                    e.preventDefault();
                    dialog.init();
                });

                if (!window.fixlinkstyle.hideFromBottom) {
                    $('#wpDiff').after('<input id="fixlinkstyle_button" value="' + UI.CLEARBUTTON2 + '" type="button">');
                    $('#fixlinkstyle_button').click(function () {
                        dialog.init();
                    });
                }
            break;
        }
    };

    if (mw.config.get('wgCanonicalNamespace') === '') {
        switch (wgaction) {
            case 'view':
                dialog.handler = dialog.handlers.api;

                var linklist = $('.extiw', '#mw-content-text').filter(function () {
                    return this.parentNode.className.indexOf('ilh-link') === -1 && this.href && this.href.indexOf('.wikipedia.org') > -1;
                });
                var $ambox = $('.mbox-text-span', '.ambox-link-style');

                if (linklist.length > 0 || $ambox.length > 0) {
                    addfixbutton();
                }
                break;

            case 'submit':
            case 'edit':
                dialog.handler = dialog.handlers.text;

                article.content = $('#wpTextbox1').val();
                article.scanInterLinks();
                if (article.interlinks.length > 0 || article.content.match(/{{\s*link style.*?}}\s*/i)) {
                    addfixbutton();
                }
                break;
        }
    }

    window.fixlinkstyle.addButton = addfixbutton;
    window.fixlinkstyle.show = function () {
        switch (wgaction) {
            case 'view':
                dialog.handler = dialog.handlers.api;
                break;
            case 'submit':
            case 'edit':
                dialog.handler = dialog.handlers.text;
        }
        dialog.init();
    };
})(jQuery, mw);
