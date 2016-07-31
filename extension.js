const St = imports.gi.St;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Soup = imports.gi.Soup;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;
const _httpSession = new Soup.SessionAsync();
const url = 'https://btc-e.com/api/3/ticker/';
const pair = 'btc_usd-btc_rur-btc_eur-ltc_btc-ltc_usd-ltc_rur-ltc_eur-nmc_btc-nmc_usd-nvc_btc-nvc_usd-usd_rur-eur_usd-eur_rur-ppc_btc-ppc_usd-dsh_btc-eth_btc-eth_ltc-eth_rur-eth_usd';
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());
let btc = new Object;
let item = {};
let box = {};
let label = {};
btc.curnames = { 
	btc:'Bitcoin',
	ltc:'Litecoin',
	nmc:'Namecoin',
	ppc:'Peercoin',
	nvc:'Novacoin',
	eth:'Ethereum',
	dsh:'Dashcoin',
	usd:'US Dollar',
	eur:'Euro',
	rur:'Russischer Rubel'
}
btc.gn = function(n){
	n = n.toLowerCase();
	return btc.curnames[n];
}
btc.jsn = function(url,func,th){
	var request = Soup.Message.new('GET',url);
        _httpSession.queue_message(request, function(_httpSession, message) {
                if (message.status_code !== 200) {
			log('ERROR:'+message.status_code);
                        return false;
                }
                let res = request.response_body.data;
                let resjsn = JSON.parse(res);
		func(res,th);
	});	
}
btc.get = function(){
	if(button.menu.isOpen){
			btc.settext('Cryptocoin Ticker','BTC-E');
			return;
	}
	var request = Soup.Message.new('GET',url+pair);
	_httpSession.queue_message(request, function(_httpSession, message) {
        	if (message.status_code !== 200) {
                	return;
        	}
		let res = request.response_body.data;
		let resjsn = JSON.parse(res);
		btc.txt = ''+resjsn.btc_usd.last+'';
		btc.settext(btc.txt);
		btc.ljsn = resjsn;
		button.menu.removeAll();
		let item = {};
		let box = {};
		let label = {};
		let itemset = {};
		let itm = {};
		let date = new Date();
		for(let j in btc.ljsn){
			let match = new RegExp('(btc_)').exec(j);
			let ccur = j.substring(0,3).toUpperCase();
			let cur = j.substring(4,7).toUpperCase();
			let v = btc.ljsn[j];
			let f = false;
			if(!itemset[ccur]){
				item = new PopupMenu.PopupSubMenuMenuItem(''+date.toDateString()+'',{style_class: 'def'});
				
				button.menu.addMenuItem(item);
				let bx = new St.BoxLayout({vertical: true, pack_start: false});
				item.actor.add_actor(bx);
				let bx2  = new St.BoxLayout({vertical: false, pack_start: false});
				bx2.add(new St.Label({text: ccur,name:'desc',style:'width:50px;font-weight:bold;color:#ddd;font-size:16px;'}));
				bx2.add(new St.Label({text: btc.gn(ccur),name:'desc',style:'width:350px;color:#fff;font-size:16px;'}));
				bx.add(bx2);
				let bx3  = new St.BoxLayout({vertical: false, pack_start: false});
				bx3.add(new St.Label({text: 'Last',name:'desc',style:'width:30px;color:#0a0;font-size:10px;'}));
				bx3.add(new St.Label({text: v.last+' '+cur,name:'desc',style:'width:100px;color:#ccc;font-size:12px;'}));
				bx3.add(new St.Label({text: 'High',name:'desc',style:'width:30px;color:#0a0;font-size:10px;'}));
				bx3.add(new St.Label({text: v.high+' '+cur,name:'desc',style:'width:100px;color:#ccc;font-size:12px;'}));
				bx3.add(new St.Label({text: 'Low',name:'desc',style:'width:30px;color:#0a0;font-size:10px;'}));
				bx3.add(new St.Label({text: v.low+' '+cur,name:'desc',style:'width:100px;color:#ccc;font-size:12px;'}));
				bx.add(bx3);
				
				itemset[ccur] = true;
				itm[j] = new PopupMenu.PopupSubMenuMenuItem('Trade history',{style_class: 'def'});
				item.menu.addMenuItem(itm[j]);
				button.menu._setOpenedSubMenu = Lang.bind(this, function (submenu) {
    					this._openedSubMenu = submenu;
				});
				subsub = new PopupMenu.PopupMenuItem('LOADING ...',{style_class: 'def'});
				itm[j].menu.addMenuItem(subsub);
				
				itm[j].menu.name = j;
				itm[j].menu.connect('open-state-changed',function(m,o){
					//this.itm._parent.menu.blockSourceEvents = true;
					if(o){
						btc.jsn('https://btc-e.com/api/3/trades/'+m.name,function(r,th){
							m.removeAll();
							let res = JSON.parse(r);
							let itms = new PopupMenu.PopupMenuItem('',{style_class: 'def'});
							m.addMenuItem(itms);
							let mvbox = new St.BoxLayout({vertical: true, pack_start: false});
							itms.actor.add_actor(mvbox);
							let clr = '#cfc';
							for(let t in res[m.name]){
								let mbox = new St.BoxLayout({vertical: false, pack_start: false});
								v = res[m.name][t];
								let ts = v.timestamp;
								let when = new Date(ts*1000);	
								mbox.add(new St.Label({text: when.toLocaleString(),name:'desc',style:'width:150px;font-weight:bold;color:#cfc;font-size:10px;'}));
								mbox.add(new St.Label({text: v.type,name:'desc',style:'width:150px;font-weight:bold;color:#cfc;font-size:10px;'}));
								mbox.add(new St.Label({text: v.amount.toString(),name:'desc',style:'width:150px;font-weight:bold;color:#cfc;font-size:10px;'}));
								mbox.add(new St.Label({text: v.price.toString(),name:'desc',style:'width:150px;font-weight:bold;color:#cfc;font-size:10px;'}));
								mvbox.add(mbox);
							}
						},this);
					}
				});
				vbox = new St.BoxLayout({vertical: true, pack_start: false});
				label = new St.Label({text: ccur,name:'desc',style:'width:50px;font-weight:bold;color:#fff;font-size:14px;'});
        			vbox.add(label);
				let dollar = new PopupMenu.PopupMenuItem('',{style_class: 'def'});
        			item.menu.addMenuItem(dollar);
				dollar.actor.add_actor(vbox);
				f = true;
			}
				btc.addItem(j,f);
		}
	});
}
btc.addLegend = function(box){
	lbox = new St.BoxLayout({vertical: false, pack_start: false});
	vbox.add(lbox);
	label = new St.Label({text: 'CUR ',name:'desc',style:'width:50px;'});
	lbox.add(label);
	label = new St.Label({text: ' LAST ',name:'desc',style:'width:100px;text-align:right;'});
	lbox.add(label);
	label = new St.Label({text: ' HIGH ',name:'desc',style:'width:100px;text-align:right;'});
	lbox.add(label);
	label = new St.Label({text: ' LOW ',name:'desc',style:'width:100px;text-align:right;'});
	lbox.add(label);
	label = new St.Label({text: ' AVG ',name:'desc',style:'width:100px;text-align:right;'});
	lbox.add(label);
}
btc.addItem = function(j,f){
	let cur = j.substring(4,7).toUpperCase();
        box = new St.BoxLayout({vertical: false, pack_start: false});
	if(f){
		
		btc.addLegend(box);
	}
        vbox.add(box);
        label = new St.Label({text: cur,name:'desc',style:'width:50px;font-weight:bold;color:#0c0;font-size:11px;'});
        box.add(label);
        label = new St.Label({text: ''+btc.ljsn[j].last+'',name:'desc',style:'width:100px;text-align:right;font-size:11px;'});
        box.add(label);
        label = new St.Label({text: ''+btc.ljsn[j].high+'',name:'desc',style:'width:100px;text-align:right;font-size:11px;'});
        box.add(label);
        label = new St.Label({text: ''+btc.ljsn[j].low+'',name:'desc',style:'width:100px;text-align:right;font-size:11px;'});
        box.add(label);
	label = new St.Label({text: ''+btc.ljsn[j].avg+'',name:'desc',style:'width:100px;text-align:right;font-size:11px;'});
        box.add(label);
	label = new St.Label({text: ''+btc.ljsn[j].vol+'',name:'desc',style:'width:100px;text-align:right;font-size:11px;'});
        box.add(label);
}
btc.settext = function(t,hl='Bitcoin BTC-E'){
	this.label.text = t;
	this.sl.text = hl;
}
btc.update = function(){
	this.get();
	Mainloop.timeout_add(30000, function () {
                btc.update();
        });
	
}
function _go(){
	let btnopts =  {
                                style_class: 'panel-button',
                                reactive: true,
                                can_focus: true,
                                x_fill: true,
                                y_fill: false,
                                track_hover: true
                        };

        let lblopts = {
                                text: 'init',
				style:'text-align:center;font-size:11px;'
                        };
        //btc.button = new St.Bin(btnopts);
	button = new PanelMenu.Button(0.0);
	box = new St.BoxLayout({vertical: true, pack_start: false});
        btc.label = new St.Label(lblopts);
	btc.sl = new St.Label({text: 'Bitcoin BTC-E',name:'desc',style:'color:#aaa;text-align:center;font-size:8px;padding:0;margin:0'});
	box.add(btc.sl);
	box.add(btc.label);
	//btc.button.set_child(btc.label);
        button.actor.add_actor(box);
	
    	//btc.button.connect('button-press-event', function (){btc.settext('...')});
	
	let item = new PopupMenu.PopupMenuItem('Loading ...',{style_class: 'def'});
	btc.update();
	//Main.notify(btc.button);
	button.menu.addMenuItem(item);
	button.menu.connect('open-state-changed',function(event,open){
		if(open){
			btc.settext('BTC-E Bitcoin Ticker','Philipp Nöhren´s');
		}else{
			btc.settext('updating');
			btc.get();
		}


	});
}

function init() {
	_go();
}

function enable() {
    Main.panel.addToStatusArea("gl0tze22", button, 0, "right");
    //Main.panel._rightBox.insert_child_at_index(btc.button, 1);
}

function disable() {
    Main.panel._rightBox.remove_child(btc.button);
}
