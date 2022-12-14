import { defineStore } from 'pinia';
import { Solar } from 'lunar-javascript';
import { ChengGuComputed,TransformWuXing } from '@/tool/utils';
import { DTS_LIST } from '@/config/book/diTianSui';
import {
	SFTK_DAYGAN_MONTH,SFTK_DAYGAN, SFTK_MONTHZHI,
} from '@/config/book/shenFengTongKao';
import { BZTY_LIST } from '@/config/book/baZiTiYao';
import {
	TYWX_DAY, TYWX_DAYGAN, TYWX_DAYGAN_TIMEZHI
} from '@/config/book/tianYuanWuXian';
import { QTBJ_LIST } from '@/config/book/qiongTongBaoJian';
import { LZXMS_LIST } from '@/config/book/liZhongXuMingShu';
import { SMTH_DAYGAN,SMTH_DAY_TIME,SMTH_MONTHZHI_DAYGAN,SMTH_MONTHZHI_DAYGANWUXING } from '@/config/book/sanMingTongHui';
import { WXJJ_DAYGAN,WXJJ_DAY_AND_TIME,WXJJ_DAY_OR_YEAR,WXJJ_DAYGANWUXING,WXJJ_MONTHZHI } from '@/config/book/wuXingJingJi';

interface GAN_ZHI {
	year: String;
	month: String;
	day: String;
	time: String;
}

export const useBookStore = defineStore('book', {
	state: () => {
		return {
			chenggu: {},
			list: []
		};
	},
	actions: {
		DealList(timestamp, gender, sect) {
			this.list = [];
			const solar = Solar.fromDate(new Date(timestamp));
			const lunar = solar.getLunar();

			const bazi = lunar.getEightChar();
			bazi.setSect(sect);

			const tiangan:GAN_ZHI = {
				year: bazi.getYearGan(),
				month: bazi.getMonthGan(),
				day: bazi.getDayGan(),
				time: bazi.getTimeGan()
			};

			const dizhi:GAN_ZHI = {
				year: bazi.getYearZhi(),
				month: bazi.getMonthZhi(),
				day: bazi.getDayZhi(),
				time: bazi.getTimeZhi()
			};

			this.chenggu = this.DEAL_TGCG(bazi.getYear(), Math.abs(lunar.getMonth()), lunar.getDay(), lunar.getTimeZhiIndex(),gender);
			this.AddItemToList(this.DEAL_DTS(tiangan));
			this.AddItemToList(this.DEAL_SFKT(tiangan,dizhi));
			this.AddItemToList(this.DEAL_BZTY(tiangan,dizhi));
			this.AddItemToList(this.DEAL_TYWX(tiangan,dizhi));
			this.AddItemToList(this.DEAL_QTBJ(tiangan,dizhi));
			this.AddItemToList(this.DEAL_LZXMS(tiangan,dizhi));
			this.AddItemToList(this.DEAL_SMTH(tiangan,dizhi));
			this.AddItemToList(this.DEAL_WXJJ(tiangan,dizhi));


		},
		AddItemToList(item){
			if(item) this.list.push(item)
		},
		// ????????????
		DEAL_TGCG(y: string, m: number, d: number, t: number,gender: number):any{
			const chenggu = ChengGuComputed(y, m, d, t);
			return {
				sign: gender == 1 ? chenggu.man : chenggu.woman,
				tip: gender == 1 ? chenggu.typesMan : chenggu.typesWoman,
				note: gender == 1 ? chenggu.notesMan : chenggu.notesWoman,
				total: chenggu.total
			};
		},
		// ?????????
		DEAL_DTS(tiangan:GAN_ZHI ){
			return {
				title: '?????????',
				icon: 'tmicon-ios-water',
				content: [{ title: null, content: DTS_LIST[tiangan.day] }]
			}
		},
		// ????????????
		DEAL_SFKT(tiangan:GAN_ZHI ,dizhi:GAN_ZHI ){
			const list = [];

			list.push({
				title: '???????????????',
				content: SFTK_DAYGAN_MONTH[tiangan.day][dizhi.month]
			});

			list.push({
				title: '????????????????????????',
				content: SFTK_DAYGAN[tiangan.day]
			});

			list.push({
				title: '????????????',
				content: SFTK_MONTHZHI[dizhi.month]
			});

			return {
				title: '????????????',
				icon: 'tmicon-layer-group',
				content: list
			};
		},
		// ????????????
		DEAL_BZTY(tiangan:GAN_ZHI ,dizhi:GAN_ZHI ){
			if(BZTY_LIST[dizhi.month][tiangan.day]?.[tiangan.time+dizhi.time]){
				return {
					title: "????????????",
					icon: 'tmicon-md-ribbon',
					content: [{title:`${dizhi.month}???${tiangan.day}???${tiangan.time+dizhi.time}???`,content:BZTY_LIST[dizhi.month][tiangan.day]?.[tiangan.time+dizhi.time]}]
				};
			}
		},
		// ????????????
		DEAL_TYWX(tiangan:GAN_ZHI ,dizhi:GAN_ZHI ){
			const list = []
			list.push({
				title: '??????',
				content: TYWX_DAY[tiangan.day+dizhi.day]
			});

			list.push({
				title: '??????',
				content: TYWX_DAYGAN_TIMEZHI[tiangan.day][dizhi.time]
			});

			list.push({
				title: '??????',
				content: TYWX_DAYGAN[tiangan.day]
			});

			return {
				title: "????????????",
				icon: 'tmicon-paper-plane',
				content: list
			};
		},
		// ????????????
		DEAL_QTBJ(tiangan:GAN_ZHI ,dizhi:GAN_ZHI ){
			let content = "";
			for(let item of QTBJ_LIST){
				const diff = item.key.split(",");
				if(diff[1] == tiangan.day){
					if(diff[0].indexOf(dizhi.month) != -1){
						content = item.content;
						break;
					}
				}
			}

			if(content){
				return {
					title: "????????????",
					icon: 'tmicon-ios-bookmarks',
					content: [{title:null,content:content}]
				};
			}
		},
		// ???????????????
		DEAL_LZXMS(tiangan:GAN_ZHI ,dizhi:GAN_ZHI){
			const list = [];
			list.push({
				title: '?????????',
				content: LZXMS_LIST[tiangan.year + dizhi.year]
			})

			list.push({
				title: '?????????',
				content: LZXMS_LIST[tiangan.day + dizhi.day]
			})

			return {
				title: "???????????????",
				icon: 'tmicon-flag-fill',
				content: list
			};
		},
		// ????????????
		DEAL_SMTH(tiangan:GAN_ZHI ,dizhi:GAN_ZHI){
			const list = [];
			list.push({
				title: '?????????????????????',
				content: SMTH_DAY_TIME[tiangan.day+dizhi.day][tiangan.time+dizhi.time]
			})

			list.push({
				title: '?????????',
				content: SMTH_DAYGAN[tiangan.day]
			})

			const md_list = SMTH_MONTHZHI_DAYGAN[dizhi.month]
			for(let key in md_list){
				if(key.indexOf(tiangan.day) != -1){
					list.push({
						title: `???${dizhi.month}??????${tiangan.day}??????`,
						content:md_list[key]
					})
				}
			}

			const wx_day = TransformWuXing(tiangan.day)

			list.push({
				title: `???${dizhi.month}????????????${wx_day}??????`,
				content: SMTH_MONTHZHI_DAYGANWUXING[dizhi.month][wx_day]
			})

			return {
				title: "????????????",
				icon: 'tmicon-process',
				content: list
			};
		},
		// ????????????
		DEAL_WXJJ(tiangan:GAN_ZHI ,dizhi:GAN_ZHI){
			const list = [];
			list.push({
				title: '?????????',
				content: WXJJ_DAY_OR_YEAR[tiangan.year+dizhi.year]
			})

			list.push({
				title: '?????????',
				content: WXJJ_DAY_OR_YEAR[tiangan.day+dizhi.day]
			})

			for(let key in WXJJ_DAYGAN){
				if(key.indexOf(tiangan.day) != -1){
					list.push({
						title: `?????????`,
						content:WXJJ_DAYGAN[key]
					})
				}
			}

			const day_time = tiangan.day + dizhi.day + tiangan.time + dizhi.time
			if(WXJJ_DAY_AND_TIME[day_time]){
				list.push({
					title: '??????????????????',
					content: WXJJ_DAY_AND_TIME[day_time]
				})
			}

			list.push({
				title: `?????????`,
				content: WXJJ_DAYGANWUXING[TransformWuXing(tiangan.day)]
			})

			list.push({
				title: '???????????????',
				content: WXJJ_MONTHZHI[dizhi.month]
			})

			return {
				title: "????????????",
				icon: 'tmicon-ios-star',
				content: list
			};
		},
	}
});
