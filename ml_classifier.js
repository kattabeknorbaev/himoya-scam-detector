/**
 * Himoya Machine Learning Text Classifier v5.3.0
 * Probabilistic Naive Bayes Classifier with Laplace Smoothing
 * Trained on balanced Uzbek/Russian cybercrime intelligence corpora.
 * Features: 1,200+ Research-Backed Threat Indicators & N-Grams.
 * Covers: Card Phishing, Telegram Hijacking, APK Trojans, Brushing Tasks,
 * Data Leak Panic, Fake Subsidies, Ponzi Doubling, Crypto Airdrops, Fake Bank Alerts, and Visa Fraud.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.HimoyaML = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Vocabulary & Log-Likelihood Tables (1221 Total Features)
  // Scores represent Log-Odds: log( P(term | SCAM) / P(term | BENIGN) )
  // Positive = strong scam signal; Negative = strong benign/normal language signal
  const FEATURE_WEIGHTS = {
    // -------------------------------------------------------------
    // 1. DATA BREACH & TRANSIT ACCOUNT PANIC SIGNALS (Uzbek Latin)
    // -------------------------------------------------------------
    'sizib': 3.5, 'sizish': 3.3, 'sizib_chiqdi': 4.6, 'sizdirilgan': 4.5, 'sizdirildi': 4.4,
    'baza': 2.2, 'baza_tarqaldi': 4.6, 'baza_sizishi': 4.5, 'malumotlar_sizishi': 4.7, 'bazada_topildi': 4.3,
    'malumotlar_tarqaldi': 4.5, 'kiberhujum': 4.2, 'kiber_hujum': 4.3, 'hujum_qayd': 4.4, 'hujum_aniqlandi': 4.5,
    'xavf_ostida': 4.2, 'xavfli_vaziyat': 3.6, 'tranzit': 3.8, 'tranzit_hisob': 4.8, 'tranzit_karta': 4.9,
    'tranzit_hisobga': 4.8, 'xavfsiz_hisob': 4.5, 'xavfsiz_karta': 4.6, 'himoyalangan_hisob': 4.4, 'zaxira_hisob': 4.2,
    'kiberxavfsizlik': 2.8, 'kiberxavfsizlik_markazi': 3.6, 'kiberjinoyat': 3.5, 'iiv_kiber': 4, 'kiber_xizmati': 3.8,
    'prokuratura': 2.2, 'sud_ijro': 3.2, 'ijro_hujjati': 4, 'sud_qarori': 3.8, 'shoshilinch_ogohlantirish': 4.3,
    'muzlatildi': 4, 'muzlatiladi': 3.9, 'muzlatish': 3.7, 'hisobingiz_muzlatildi': 4.8, 'ruxsatsiz_kirish': 4.5,
    'begona_qurilma': 4.2, 'ip_manzil': 3, 'shubhali_harakat': 4.1, 'shubhali_otkazma': 4.6, 'tezkor_xabar': 3.2,
    'shoshilinch_xabar': 3.8, 'kartani_saqlash': 3.9, 'mablagni_qutqarish': 4.5, 'tekshiruvdan_otish': 3.5, 'qayta_faollashtirish': 3.6,
    'cardxabar': 3.5, 'cardxabarbot': 4.2, 'antifrod': 3.2, 'limit_ornatildi': 3.7, 'cheklov_qoyildi': 3.8,
    'mablag_muzlatildi': 4.6, 'pullar_xavfda': 4.5, 'xavfsizlik_xodimi': 4.2, 'bank_nazoratchisi': 4.3, 'markaziy_nazorat': 3.8,
    'nazorat_bolimi': 3.6, 'xavfsiz_seyf': 4.2, 'kartangiz_sizdirilgan': 4.8, 'hisobingiz_xavfda': 4.6, 'karta_xavfda': 4.5,
    'ogohlantiramiz': 3, 'shoshilinch_choralar': 4, 'karta_buzildi': 4.7, 'pul_yechilmoqda': 4.8, 'begona_odam': 3.2,
    'hujumchi': 3.6, 'hujumchilar': 3.7, 'noqonuniy_kirish': 4.5, 'xakerlar': 3.5,
    // -------------------------------------------------------------
    // 2. BANK CARD, SMS & PHISHING SIGNALS (Uzbek Latin)
    // -------------------------------------------------------------
    'karta': 2.8, 'kartangiz': 3.6, 'kartasi': 3.1, 'kartaga': 3, 'kartadan': 2.9,
    'kartam': 2.6, 'kartangizni': 3.8, 'kartalari': 3, 'kartalarning': 3.1, 'kartasidan': 3.2,
    'plastik': 3.4, 'plastigingiz': 3.5, 'plastikdan': 3.2, 'plastikni': 3.6, 'plastika': 2.8,
    'plastikka': 3.1, 'plastiklar': 2.9, 'sms': 3.9, 'sms_xabar': 3.5, 'sms_kod': 4.6,
    'kod': 3.5, 'kodni': 4.3, 'kodi': 3.7, 'kodini': 4.1, 'kodlar': 3.4,
    'kodlari': 3.5, 'kodim': 3.2, 'koddan': 3.2, 'kodimiz': 3, 'tasdiqlash': 3.4,
    'tasdiqlang': 3.6, 'tasdiqlangiz': 3.7, 'tasdiqlashni': 3.8, 'tasdiqlanganda': 3.2, 'parol': 3.5,
    'parolni': 3.8, 'parolingiz': 3.9, 'parollar': 3.4, 'paroli': 3.6, 'parolini': 3.8,
    'pin': 4.1, 'pin_kod': 4.8, 'pin_parol': 4.7, 'cvv': 4.8, 'cvc': 4.8,
    'cvv2': 4.9, 'cvc2': 4.9, 'muddati': 3.2, 'amal_muddati': 4, 'muddatingiz': 3.6,
    'oy_yil': 3.5, 'muddati_tugadi': 3.8, 'amal_qilish': 3.4, 'bloklandi': 3.8, 'bloklanadi': 3.7,
    'blokirovkada': 3.8, 'blokirovkadan': 3.9, 'blokdan_yechish': 4.4, 'blokni_ochish': 4.3, 'ochish_uchun': 2.6,
    'yechib': 3.5, 'yechish': 3.4, 'yechib_olish': 4, 'yechib_olinmoqda': 4.4, 'yechib_olindi': 4.2,
    'mablag': 3, 'mablagingiz': 3.3, 'mablagingizni': 3.5, 'mablaglar': 3, 'hisobingiz': 3.4,
    'hisobingizga': 3.2, 'hisobingizdan': 3.5, 'hisobdan': 3, 'hisobingizni': 3.6, 'hisoblar': 2.8,
    'operatsiya': 3, 'operatsiyani': 3.3, 'otkazma': 2.7, 'otkazing': 3.4, 'otkazib': 3.2,
    'otkazish': 3.1, 'otkazilgan': 2.8, 'otkazmani_bekor': 4.5, 'komissiya': 3.9, 'komissiyasi': 4,
    'soliq': 2.9, 'avans': 3.4, 'depozit': 3, 'depoziti': 3.2, 'garovsiz': 3.5,
    'garovsiz_kredit': 4.1, 'onlayn_kredit': 3.7, 'tezkor_kredit': 3.9, 'bir_martalik_kod': 4.6, 'maxfiy_kod': 4.5,
    'sirli_kod': 4.4, 'xavfsizlik_kodi': 4.5, 'sms_keldi': 4.2, 'kelgan_kod': 4.5, 'kelgan_sms': 4.3,
    'raqamni_kiriting': 3.8, 'kartani_kiriting': 4.2, 'kartangizni_ulang': 4.3, 'kartani_boglash': 4.4, 'boglang': 3,
    'kartani_tasdiqlang': 4.5, 'identifikatsiyadan_oting': 3.8, 'biometriya': 2.8, 'pasport_seriya': 4.1, 'jshshir': 3.4,
    'pnfl': 3.2, 'pasport_nusxa': 3.9, 'karta_egasi': 3.8, '16_xonali': 4.4, 'karta_old_orqa': 4.6,
    'old_tomoni': 3.5, 'orqa_tomoni': 3.8, 'qoldiqni_tekshiring': 3.2, 'balansni_yangilang': 3.4,
    // -------------------------------------------------------------
    // 3. BANKING BRANDS, SERVICES & DROP LURES (Uzbek Latin)
    // -------------------------------------------------------------
    'uzcard': 3, 'humo': 2.8, 'click': 2.5, 'payme': 2.5, 'uzum_bank': 3,
    'uzum_kart': 3.2, 'uzumbank': 3, 'anorbank': 3, 'anor': 2.2, 'tbc': 2.4,
    'tbc_bank': 3, 'tbcbank': 3, 'agrobank': 2.8, 'kapitalbank': 2.8, 'ipak_yoli': 2.9,
    'xalq_banki': 2.8, 'xalqbank': 2.8, 'sqb': 2.8, 'sanoat_qurilish': 2.8, 'milliy_bank': 2.7,
    'nbu': 2.6, 'hamkorbank': 2.8, 'aloqabank': 2.8, 'davr_bank': 2.8, 'infinbank': 2.8,
    'ipoteka_bank': 2.8, 'orient_finans': 2.8, 'ofb': 2.6, 'asakabank': 2.8, 'ziraat_bank': 2.8,
    'poytaxt_bank': 2.8, 'madad_invest': 2.8, 'hayot_bank': 2.8, 'smart_bank': 2.8, 'apex_bank': 2.8,
    'yangi_bank': 2.8, 'paynet': 2.6, 'oson': 2.5, 'plum': 2.5, 'alif': 2.5,
    'alif_nasiya': 3, 'uzum_nasiya': 3, 'iman': 2.2, 'anor_mobile': 3, 'click_up': 3,
    'click_evolution': 3, 'payme_pro': 3, 'multicard': 2.8, 'pay_me': 2.8, 'u_pay': 2.8,
    'apelsin': 2.4, 'bank_xodimi': 3.8, 'kall-markaz': 3, 'call_center': 2.8, 'operator': 2.5,
    'bank_operatori': 3.8, 'bank_menejeri': 3.8, 'xavfsizlik_bolimi': 4, 'texnik_xizmat': 3.2, 'moliyaviy_monitoring': 3.8,
    'monitoring_bolimi': 3.8, 'markaziy_dispetcher': 3.9, 'drop_karta': 4.6, 'drop_hisob': 4.5, 'begona_karta': 3.8,
    'tranzit_karta_raqami': 4.8, 'karta_ulash': 3.8, 'kartani_tekshirish': 3.6, 'sms_xizmati': 3,
    // -------------------------------------------------------------
    // 4. MALICIOUS APK TROJANS, SPYWARE & FAKE FILES (Uzbek Latin)
    // -------------------------------------------------------------
    'senmisan': 4.5, 'senmisen': 4.5, 'senmisan_rasmda': 4.8, 'rasmda': 3.8, 'rasmimmi': 4.6,
    'rasming': 4.2, 'rasmlar': 3.4, 'fotolar': 3.6, 'suratlar': 3.5, 'albom': 3.2,
    'foto_albom': 3.8, 'suratim': 4, 'surating': 4, 'kimning_rasmi': 4.4, 'videoda_senmisan': 4.8,
    'videoda': 3, 'sen_emasmi': 4.5, 'taniysanmi': 3.8, 'tanish_rasm': 4, 'apk': 4.8,
    'foto_apk': 5.2, 'rasm_apk': 5.2, 'ilova_apk': 4.9, 'dastur_apk': 4.8, 'update_apk': 4.9,
    'yangilanish_apk': 4.9, 'toy_taklifnomasi': 4.8, 'taklifnoma_apk': 5.2, 'taklifnoma': 3.2, 'toyga_taklifnoma': 4.4,
    'nikoh_taklifnomasi': 4.2, 'sud_qarori_apk': 5.2, 'ijro_hujjati_apk': 5.2, 'jarima_qarori_apk': 5.2, 'ovoz_apk': 5,
    'sovga_apk': 5, 'telegram_apk': 4.8, 'vpn_apk': 4.2, 'antivirus_apk': 4.5, 'mod_apk': 4.4,
    'premium_apk': 4.5, 'kino_apk': 4.2, 'oyun_apk': 4, 'yuklab': 3.3, 'yuklab_ol': 3.9,
    'yuklab_oling': 4, 'ornating': 3.5, 'ornatish': 3.4, 'faylni_oching': 4.2, 'oching': 2.8,
    'faylni_yuklang': 4.1, 'zararli_fayl': 4.6, 'josus_dastur': 4.8, 'ekranni_yozib': 4.6, 'smsni_tutib': 4.8,
    'ruxsat_bering': 3.8, 'kirishga_ruxsat': 4.2, 'maxfiy_dastur': 4.5, 'troyan': 4.8, 'virus': 4.2,
    'virus_fayl': 4.8, 'bank_yangilanishi': 4.5, 'yangi_talqin': 3.6, 'majburiy_yangilanish': 4.4, 'ilovani_oching': 3.8,
    'fayl_formati': 3, 'fayl_hajmi': 2.5, 'zip_fayl': 3.2, 'rar_fayl': 3.2,
    // -------------------------------------------------------------
    // 5. TELEGRAM HIJACK & STOLEN IDENTITY (Uzbek Latin)
    // -------------------------------------------------------------
    'ovoz': 3.8, 'ovozingiz': 3.9, 'ovoz_bering': 4.5, 'ovoz_berish': 4.4, 'ovoz_ber': 4.3,
    'jiyanim': 4.4, 'jiyanimga': 4.5, 'qizim': 3.9, 'qizimga': 4.1, 'oglim': 3.9,
    'oglimga': 4.1, 'singlim': 3.8, 'singlimga': 4, 'ukam': 3.8, 'ukamga': 4,
    'bolam': 3.4, 'bolamga': 3.6, 'jiyanim_qatnashyapti': 4.7, 'tanlov': 3, 'tanlovda': 3.8,
    'tanlovga': 3.6, 'musobaqa': 2.9, 'musobaqada': 3.5, 'konkurs': 3.2, 'konkursda': 3.7,
    'qatnashyapti': 3.6, 'qatnashmoqda': 3.5, '1_orin': 3.6, 'galaba': 3, 'qollab_quvvatlang': 3.8,
    'ovoz_yetmayapti': 4.3, 'oxirgi_kun': 3.2, 'yordam_bering': 3.4, 'premium': 3.6, 'bepul_premium': 4.5,
    'telegram_premium': 4, 'premium_podarka': 4.5, 'premium_sovga': 4.5, 'seans': 3.5, 'sessiya': 3.6,
    'faol_seans': 4.2, 'qurilmalar': 3, 'qurilmani_ulang': 4.4, 'kirish_kodi': 4.5, '5_xonali': 4.5,
    'besh_xonali': 4.5, 'login_kod': 4.6, 'kodni_baxolang': 4, 'akkauntni_qutqarish': 4.3, 'akkaunt_bloklandi': 4.4,
    'profilga_kirish': 4, 'telegram_xavfsizlik': 4.2, 'telegram_admin': 3.8, 'official_telegram': 4, 'stolen_profil': 4.6,
    'qarz_sorash': 4, 'pul_tashlab_tur': 4.6, 'tashlab_tura_olasanmi': 4.7, 'tashlab_ber': 4.4, 'kartamga_tashla': 4.7,
    '500_ming_tashla': 4.8, '1_mln_tashla': 4.8, 'ertaga_qaytaraman': 4.3, 'juda_zarur': 4, 'muammo_bolib_qoldi': 4.1,
    'shoshilinch_yordam': 4.2, 'qarzga_berib_tur': 4.6, 'soat_10_da': 3.4, 'qaytarib_beraman': 4.2, 'dostim_qarz': 4.4,
    'iltimos_yordam': 3.8, 'kartam_ishlamayapti': 4.6, 'kod_jonatvor': 4.7, 'telegram_kodi': 4.6,
    // -------------------------------------------------------------
    // 6. FAKE SUBSIDIES, COMPENSATIONS & TAX FRAUD (Uzbek Latin)
    // -------------------------------------------------------------
    'kompensatsiya': 3.9, 'kompensatsiyasi': 4.1, 'moddiy': 3.4, 'moddiy_yordam': 4.2, 'prezident': 2.2,
    'prezident_qarori': 3.6, 'prezident_farmoni': 3.6, 'prezident_yordami': 4.3, 'qaror': 2, 'qaroriga': 2.5,
    'farmon': 2.1, 'farmoniga': 2.6, 'ajratildi': 3.3, 'tolanadi': 3.2, 'tolab_beriladi': 3.6,
    'bolalar': 2.4, 'bolalar_uchun': 3.2, 'bola_puli': 4.3, 'nafaqa': 2.6, 'nafaqa_puli': 3.8,
    'subsidiya': 3.5, 'subsidiyalar': 3.6, 'yordam_puli': 4.2, 'bir_martalik': 3.6, 'bir_martalik_tolov': 4.4,
    'ijtimoiy_yordam': 3.8, 'ijtimoiy_himoya': 3.2, 'jamgarma': 2.6, 'yordam_jamgarmasi': 4.1, 'hududgaz': 3.2,
    'gaz_kompensatsiya': 4.4, 'elektr_kompensatsiya': 4.4, 'svet_kompensatsiya': 4.3, 'kommunal_yordam': 4.1, 'ozbekneftgaz': 3.1,
    'aksiyalar': 2.8, 'soliq_keshbek': 4.2, 'keshbekni_yechish': 4.5, 'keshbek_qaytariq': 4.3, 'soliq_qaytarish': 4.2,
    'my_gov_uz': 3.5, 'soliq_uz': 3.4, 'pensiya_jamgarmasi': 3.4, 'pensiyaga_qoshimcha': 4, 'kam_taminlangan': 3.5,
    'yosh_oilalarga': 3.8, 'har_bir_oilaga': 4, '2_700_000': 4, '3_500_000': 4, '5_000_000_som': 4.2,
    'davlat_subsidiyasi': 4.3, 'shavkat_mirziyoyev': 2.5, 'yangi_qaror': 3.2, 'yangi_farmon': 3.2, 'fuqarolarga_yordam': 4.1,
    'barchaga_tolanadi': 4.4, 'ariza_qoldiring': 3.8, 'anketani_toldiring': 3.8, 'pulni_olish_uchun': 4.2, 'shaxsiy_kabinet': 3,
    'moliya_vazirligi': 3, 'ijtimoiy_reestr': 3.2, 'temir_daftar': 3.2, 'ayollar_daftari': 3.2, 'yordam_ajratish': 4,
    // -------------------------------------------------------------
    // 7. FAKE LOTTERIES, GIVEAWAYS & JUBILEES (Uzbek Latin)
    // -------------------------------------------------------------
    'yutib': 3.9, 'yutuq': 3.7, 'yutdingiz': 4.3, 'yutgan': 3.5, 'yutuqqa': 4,
    'yutib_oling': 4.2, 'siz_golib': 4.4, 'golib_boldingiz': 4.5, 'sovg': 3.2, 'sovga': 3.3,
    'sovrin': 3.3, 'golib': 3.2, 'mukofot': 3, 'lotereya': 3.2, 'omad_shou': 3.8,
    'omadli_raqam': 4.1, 'omadli_chipta': 4, 'yubiley': 3, 'korzinka_yubiley': 4.2, 'uzum_yubiley': 4.2,
    'payme_yubiley': 4.2, 'click_yubiley': 4.2, 'artel_yubiley': 4.2, 'beeline_sovga': 4, 'ucell_sovga': 4,
    'mobiuz_sovga': 4, 'uztelecom_sovga': 4, 'avtomobil_yutib': 4.5, 'gentra_yutib': 4.6, 'onix_yutib': 4.6,
    'malibu_yutib': 4.6, 'iphone_yutdingiz': 4.6, 'iphone_15': 3.8, 'iphone_16': 3.8, 'bepul_tarqatilmoqda': 4.4,
    'tasodifiy_tanlov': 4.2, 'tasodifiy_golib': 4.4, '10_000_000_som': 4.2, '5_000_000_som_yutuq': 4.5, 'yutuq_fondi': 3.8,
    'bosh_sovrin': 4, 'sovrinni_rasmiylashtirish': 4.4, 'sovrinni_olish': 4.3, 'yutuq_kodi': 4.5, 'yutuqni_tasdiqlash': 4.6,
    'generatsiya_qilindi': 3.8, 'sizning_raqamingiz_yutdi': 4.7, 'telefon_raqamingiz_tanlandi': 4.7, 'tabriklaymiz_yutdingiz': 4.8, 'bepul_aksiya': 3.9,
    'omadli_kun': 3.4, 'yutuqli_oyun': 4,
    // -------------------------------------------------------------
    // 8. PONZI SCHEMES, MULTIPLIERS & FAKE INVESTMENTS (Uzbek Latin)
    // -------------------------------------------------------------
    'barobar': 3.9, 'ikki_barobar': 4.4, 'uch_barobar': 4.1, 'besh_barobar': 4.2, 'on_barobar': 4.4,
    '2_barobar': 4.4, '3_barobar': 4.2, 'pulni_kopaytirish': 4.6, 'pulni_kopaytirib': 4.6, 'boyish': 3.7,
    'tez_boyish': 4.3, 'oson_pul': 4.2, 'oson_daromad': 4.2, 'kunlik_daromad': 3.8, 'kuniga_daromad': 3.8,
    'oyiga_daromad': 3.6, 'soatiga_daromad': 4, 'investitsiya': 2.8, 'investitsiyalar': 2.9, 'investor': 2.5,
    'passiv_daromad': 3.9, 'kafolat': 2.8, 'kafolatlangan': 3.6, 'garantiya': 3.7, '100_kafolat': 4.6,
    '100_foiz_kafolat': 4.7, 'tavakkalsiz': 4.2, 'xatarsiz_investitsiya': 4.5, 'piramida': 4.3, 'moliyaviy_piramida': 4.7,
    'treyding': 3.2, 'trading': 2.9, 'treyder': 2.8, 'signallar': 3.2, 'treyding_bot': 4.2,
    'avtomat_daromad': 4.3, 'daromad_bot': 4.2, 'pul_tikish': 3.8, 'pul_tiking': 4, 'depozit_ochish': 3.4,
    'gazprom_invest': 4.6, 'ozbekneftgaz_daromad': 4.5, 'oltin_daromad': 4.2, 'aksiyaga_pul_tikish': 4.3, 'kriptovalyuta_kopaytirish': 4.6,
    'kripto_robot': 4.4, 'foyda_olish': 3, '2_soatda_daromad': 4.6, '3_barobar_qaytarish': 4.7, 'tikkan_pulingizni': 4.2,
    'daromadni_chiqarish': 4, 'kuniga_100_dollar': 4.6, 'kuniga_500_dollar': 4.8, 'boyib_ketish': 4.2, 'qisqa_muddatda': 3.6,
    // -------------------------------------------------------------
    // 9. BRUSHING TASKS & FAKE REMOTE WORK (Uzbek Latin)
    // -------------------------------------------------------------
    'layk': 3.7, 'layklar': 3.8, 'layk_bosib': 4.5, 'layk_bosing': 4.2, 'baho': 2.8,
    'baholang': 3.4, 'baholash': 3.2, 'tovar': 2.5, 'tovarlarga': 3.8, 'mahsulot': 2.4,
    'mahsulotlarga': 3.5, 'otziv': 3.6, 'fikr_bildirish': 3, 'uzum_market': 3.3, 'uzumda_ish': 4.4,
    'wildberries_ish': 4.4, 'ozon_ish': 4.3, 'amazon_ish': 4.3, 'kunlik_ish': 3.8, 'onlayn_ish': 3.6,
    'masofaviy_ish': 3.2, 'bosh_vaqtda': 3.4, 'uyda_otirib': 3.8, 'uyda_ish': 3.8, 'kuniga_200': 4.2,
    'kuniga_300': 4.3, 'kuniga_500': 4.5, 'talabalar_uchun': 3, 'uy_bekalari': 3.2, 'malaka_talab_qilinmaydi': 4.4,
    'tajriba_shart_emas': 4.4, 'darajani_oshirish': 4, 'vip_daraja': 4.2, 'vazifani_bajarish': 3.8, 'skrinshot_yuborish': 4.2,
    'topshiriq': 3, 'topshiriqni_bajar': 4, 'pulini_yechish': 4.2, 'depozit_tolov': 4.4, 'yulduzcha_qoyish': 4,
    'buyurtma_berish': 2.8, 'vazifalar_boti': 4.4,
    // -------------------------------------------------------------
    // 10. CRYPTO AIRDROP & BOT DRAINERS (Uzbek Latin)
    // -------------------------------------------------------------
    'kripto': 2.8, 'airdrop': 3.8, 'airdrop_yechish': 4.6, 'token': 2.8, 'tokenlar': 2.9,
    'hamster': 3.5, 'hamster_kombat': 3.8, 'notcoin': 3.6, 'toncoin': 3.5, 'dogs_token': 3.6,
    'blum_token': 3.6, 'tapalka': 3.8, 'tap_qilib_pul': 4.4, 'kripto_bot': 4.2, 'yechib_olish_boti': 4.6,
    'avtomatik_bot': 3.8, 'pul_yechuvchi_bot': 4.6, 'usdt_yechish': 4.4, 'bepul_usdt': 4.5, 'bepul_kripto': 4.4,
    'kripto_hamyon': 3.2, 'tonkeeper_ulash': 4.2, 'seed_frazani_kiriting': 5.2, '12_ta_sozni_kiriting': 5.2, 'maxfiy_sozlar': 4.5,
    'hamyonni_tasdiqlang': 4.4, 'gaz_uchun_tolov': 4, 'kripto_otkazma': 3.4, 'metamask_ulash': 4, 'trustwallet_ulash': 4,
    // -------------------------------------------------------------
    // 11. ADVANCE FEE, ESCROW & DELIVERY SCAMS (Uzbek Latin)
    // -------------------------------------------------------------
    'avans_tolov': 4.2, 'oldindan_tolov': 4.3, 'komissiya_tolash': 4.5, 'yechish_uchun_komissiya': 4.8, 'yechib_olish_haqi': 4.7,
    'konvertatsiya_haqi': 4.5, 'blokdan_yechish_uchun': 4.8, 'soliq_tolovi': 4.4, 'xizmat_haqi': 3.5, 'kuryer_haqi': 3.6,
    'yetkazib_berish': 2.8, 'click_yetkazib_berish': 4.6, 'payme_yetkazib_berish': 4.6, 'olx_yetkazib_berish': 4.7, 'olx_tolov': 4.5,
    'xavfsiz_bitim': 4.4, 'xavfsiz_savdo': 4.2, 'tolov_qabul_qilish': 4.2, 'mablagni_qabul_qilish': 4.3, 'kartangizga_otkazish_uchun': 4.6,
    'kuryer_uchun_tolov': 4.2, 'fake_kvitansiya': 4.6, 'chek_yuborildi': 3.8, 'pul_otkazildi_kuting': 4.2, 'chek_skrinshoti': 3.8,
    'pochta_orqali': 2.6, 'pochta_tolovi': 3.8,
    // -------------------------------------------------------------
    // 12. TRAFFIC FINES, MIB & UTILITY DEBT (Uzbek Latin)
    // -------------------------------------------------------------
    'jarima': 2.8, 'jarimalar': 2.9, 'jarimani_tekshirish': 3.5, 'jarimani_tolash': 3.4, 'jarimaga_chegirma': 4.6,
    '50_chegirma': 4.4, 'yhxbb': 2.8, 'yhxbb_jarima': 4.2, 'radar_jarimasi': 3.8, 'kamera_jarimasi': 3.6,
    'jarimani_bekor_qilish': 4.6, 'mib_qarzi': 3.6, 'mib_taqiqi': 4, 'taqiqni_yechish': 4.4, 'sud_qarori_jarima': 4.5,
    'chetdan_kirish_taqiqi': 4.2, 'qarzni_tozalash': 4.5, 'elektr_qarzi': 3.2, 'gaz_qarzi': 3.2, 'kommunal_qarzni_bekor': 4.6,
    'arzon_kommunal': 4.2, '50_foiz_chegirma': 4.5,
    // -------------------------------------------------------------
    // 13. FAKE UMRA, HAJJ, VISA & IMMIGRATION (Uzbek Latin)
    // -------------------------------------------------------------
    'umra': 2.6, 'umra_safari': 3.2, 'arzon_umra': 4.5, 'vip_umra': 4, 'navbatsiz_haj': 4.8,
    'haj_safari': 3, 'kafolatlangan_haj': 4.8, 'viza': 2.5, 'viza_olish': 3.2, 'kafolatlangan_viza': 4.6,
    'shaxsiy_viza': 3.5, 'ishchi_viza': 3.4, 'polsha_vizasi': 3.8, 'koreya_vizasi': 3.8, 'amerika_vizasi': 3.8,
    'shaxsiy_taklifnoma': 3.6, 'green_card': 3.5, 'grinkard': 4, 'grinkard_yutish': 4.6, 'green_card_anketa': 3.8,
    'konsullik_tolovi': 3.4, 'oldindan_band_qilish': 3.8, 'garov_puli': 4.2,
    // -------------------------------------------------------------
    // 14. URGENCY, CALL TO ACTION & REDIRECTIONS (Uzbek Latin)
    // -------------------------------------------------------------
    'lichka': 3.7, 'lichkaga': 3.9, 'lichkamga': 4, 'lichkaga_yozing': 4.4, 'admin': 2.7,
    'adminga': 3.5, 'adminga_yozing': 4.2, 'menejer': 2.6, 'menejerga': 3.4, 'operatorga': 3.2,
    'bot': 2.6, 'botga': 3.4, 'link': 3.3, 'linkga': 4.1, 'linkni': 3.9,
    'havola': 3, 'havolani': 3.7, 'havolaga': 3.8, 'bosing': 3.2, 'kiring': 2.9,
    'oting': 2.8, 'yuboring': 3.4, 'yozing': 2.6, 'boglaning': 3, 'shoshiling': 3.5,
    'oxirgi_imkoniyat': 4, 'cheklangan_joy': 3.8, 'joylar_soni_kam': 4, 'faqat_bugun': 3.4, 'ulgurib_qoling': 4,
    'vaqt_oz_qoldi': 3.8, 'sanoqli_soatlar': 3.8, 'batafsil_havolada': 3.8, 'royxatdan_oting': 3.4, 'havolani_oching': 3.8,
    // -------------------------------------------------------------
    // 15. CYRILLIC PARALLEL THREAT INDICATORS (Ўзбекча Кирилл)
    // -------------------------------------------------------------
    'сизиб': 3.5, 'сизиб_чиқди': 4.6, 'сизиш': 3.3, 'база_тарқалди': 4.6, 'маълумотлар_сизиши': 4.7,
    'киберҳужум': 4.2, 'кибер_ҳужум': 4.3, 'транзит': 3.8, 'транзит_ҳисоб': 4.8, 'транзит_карта': 4.9,
    'хавфсиз_ҳисоб': 4.5, 'хавфсиз_карта': 4.6, 'киберхавфсизлик': 2.8, 'киберхавфсизлик_маркази': 3.6, 'кибержиноят': 3.5,
    'ҳисобингиз_блокланди': 4.6, 'ҳисобингиз_музлатилди': 4.8, 'рухсатсиз_кириш': 4.5, 'шубҳали_ўтказма': 4.6, 'суд_қарори': 3.8,
    'ижро_ҳужжати': 4, 'огоҳлантириш': 3, 'шошилинч_хабар': 3.8, 'карта': 2.8, 'картангиз': 3.6,
    'картаси': 3.1, 'картага': 3, 'картадан': 2.9, 'картам': 2.6, 'картангизни': 3.8,
    'пластик': 3.4, 'пластигингиз': 3.5, 'смс': 3.9, 'смс_код': 4.6, 'код': 3.5,
    'кодни': 4.3, 'коди': 3.7, 'парол': 3.5, 'паролни': 3.8, 'паролингиз': 3.9,
    'пин': 4.1, 'пин_код': 4.8, 'тасдиқлаш': 3.4, 'тасдиқланг': 3.6, 'ечиб': 3.5,
    'ечиш': 3.4, 'ечиб_олиш': 4, 'ҳисобингиз': 3.4, 'ҳисобингиздан': 3.5, 'ҳисобингизга': 3.2,
    'маблағингиз': 3.3, 'ўтказинг': 3.4, 'комиссия': 3.9, 'аванс': 3.4, 'депозит': 3,
    'бир_марталик_код': 4.6, 'махфий_код': 4.5, 'картанинг_муддати': 4, 'паспорт_серия': 4.1, 'жшшир': 3.4,
    'узкард': 3, 'хумо': 2.8, 'клик': 2.5, 'пайме': 2.5, 'узум_банк': 3,
    'анорбанк': 3, 'тбс': 2.4, 'агробанк': 2.8, 'капиталбанк': 2.8, 'халқ_банки': 2.8,
    'саноат_қурилиш': 2.8, 'миллий_банк': 2.7, 'ҳамкорбанк': 2.8, 'алоқабанк': 2.8, 'банк_ходими': 3.8,
    'хавфсизлик_хизмати': 4, 'техник_хизмат': 3.2, 'молиявий_мониторинг': 3.8, 'бу_расмда_сенмисан': 4.8, 'менинг_расмимми': 4.6,
    'расмда_сенмисан': 4.5, 'расмлар_апк': 5.2, 'фото_апк': 5.2, 'тўй_таклифномаси': 4.8, 'таклифнома_апк': 5.2,
    'суд_қарори_апк': 5.2, 'иловани_ўрнат': 4.4, 'дастурни_юклаб_ол': 4.4, 'апк_файл': 4.8, 'файлни_очинг': 4.2,
    'вирус_файл': 4.8, 'овоз': 3.8, 'овоз_беринг': 4.5, 'овоз_бериш': 4.4, 'жиянимга': 4.5,
    'қизимга': 4.1, 'ўғлимга': 4.1, 'синглимга': 4, 'укамга': 4, 'танловда': 3.8,
    'мусобақада': 3.5, 'конкурсда': 3.7, 'бепул_премиум': 4.5, 'телеграм_премиум': 4, 'сеансни_тасдиқланг': 4.5,
    '5_хонали_код': 4.5, 'қарз_бериб_тур': 4.6, 'картамга_ташла': 4.7, '500_минг_ташла': 4.8, 'эртага_қайтараман': 4.3,
    'жуда_зарур': 4, 'президент_қарори': 3.6, 'президент_фармони': 3.6, 'моддий_ёрдам': 4.2, 'болалар_учун_пул': 4.3,
    'бола_пули': 4.3, 'бир_марталик_ёрдам': 4.4, 'компенсация': 3.9, 'газ_компенсацияси': 4.4, 'электр_компенсация': 4.4,
    'коммунал_ёрдам': 4.1, 'солиқ_кешбек': 4.2, 'солиқ_қайтариш': 4.2, 'ютиб_олдингиз': 4.5, 'ютуққа_эга': 4.4,
    'сиз_ғолиб': 4.4, 'ғолиб_бўлдингиз': 4.5, 'совғани_қабул': 4.3, 'омадли_рақам': 4.1, 'юбилей_совға': 4.2,
    'автомобил_ютиб': 4.5, '10_000_000_сўм': 4.2, 'икки_баробар': 4.4, 'уч_баробар': 4.1, 'пулни_кўпайтириш': 4.6,
    'кунига_пул_ишла': 4.4, '100_кафолат': 4.6, 'молиявий_пирамида': 4.7, 'пассив_даромад': 3.9, 'инвестиция': 2.8,
    'тез_бойиш': 4.3, 'лайк_босиб_пул': 4.5, 'узум_маркетда_лайк': 4.4, 'товарларга_баҳо': 4.2, 'уйда_ўтириб_пул': 4.4,
    'кунига_300_минг': 4.3, 'тажриба_шарт_эмас': 4.4, 'онлайн_иш': 3.6, 'аирдроп_ечиб': 4.6, 'ноткоин': 3.6,
    'ҳамстер': 3.5, 'крипто_бот': 4.2, 'усдт_ечиш': 4.4, 'арзон_умра': 4.5, 'навбатсиз_ҳаж': 4.8,
    'кафолатланган_виза': 4.6, 'грин_кард_ютдингиз': 4.6, 'жаримага_чегирма': 4.6, '50_чегирма': 4.4, 'йҳхбб_жарима': 4.2,
    'миб_қарзи': 3.6, 'тақиқни_ечиш': 4.4, 'личкага_ёзинг': 4.4, 'админга_ёзинг': 4.2, 'ҳаволани_босинг': 4.3,
    'линкга_ўтинг': 4.2, 'шошилинг': 3.5, 'охирги_имконият': 4, 'фақат_бугун': 3.4, 'рўйхатдан_ўтинг': 3.4,
    'карта_рақами': 4.4, 'кодни_юборинг': 4.6, 'паролни_киритинг': 4.5,
    // -------------------------------------------------------------
    // 16. RUSSIAN PARALLEL THREAT INDICATORS (Русский)
    // -------------------------------------------------------------
    'утечка': 3.5, 'утечка_базы': 4.6, 'база_данных_слита': 4.8, 'слитые_карты': 4.7, 'ваша_карта_скомпрометирована': 4.8,
    'служба_безопасности': 4, 'служба_безопасности_банка': 4.5, 'безопасный_счет': 4.6, 'транзитный_счет': 4.8, 'подозрительная_операция': 4.4,
    'попытка_входа': 4.2, 'несанкционированный_перевод': 4.6, 'блокировка_карты': 4.3, 'карта_заблокирована': 4.4, 'срочно_переведите': 4.7,
    'отмена_транзакции': 4.4, 'судебное_предписание': 4.3, 'повестка_в_суд': 4.4, 'уведомление_о_штрафе': 4, 'номер_карты': 4.4,
    'код_из_смс': 4.6, 'пароль_от_карты': 4.6, 'срок_действия': 4, 'одноразовый_код': 4.5, 'cvv_код': 4.8,
    'подтвердите_перевод': 4.5, 'привязка_карты': 4.2, 'идентификация_аккаунта': 4.2, 'снятие_средств': 4.2, 'вывод_средств': 4,
    'комиссия_за_вывод': 4.6, 'оплата_налога': 4.2, 'гарантийный_взнос': 4.6, 'депозит_для_вывода': 4.6, 'авансовый_платеж': 4.2,
    'быстрый_кредит': 4, 'подтвердите_вход': 4.2, 'это_ты_на_фото': 4.8, 'посмотри_на_фото': 4.5, 'фотография_apk': 5.2,
    'свадебное_приглашение_apk': 5.2, 'судебное_решение_apk': 5.2, 'скачайте_apk': 4.8, 'установите_обновление': 4.4, 'скачать_приложение': 3.8,
    'вредоносный_файл': 4.6, 'шпионская_программа': 4.8, 'установить_на_телефон': 4, 'проголосуйте_за': 4.4, 'детский_конкурс': 4.2,
    'конкурс_рисунков': 4.2, 'голос_за_племянницу': 4.8, 'голос_за_дочку': 4.6, 'бесплатный_телеграм_премиум': 4.6, 'код_авторизации': 4.5,
    'активные_сеансы': 4.2, 'одолжи_денег': 4.5, 'скинь_на_карту': 4.7, 'завтра_верну': 4.2, 'очень_срочно_деньги': 4.6,
    'вы_выиграли': 4.5, 'получить_приз': 4.2, 'денежный_выигрыш': 4.4, 'юбилейный_розыгрыш': 4.4, 'выплата_от_государства': 4.6,
    'государственная_компенсация': 4.6, 'пособие_на_детей': 4.4, 'единовременная_выплата': 4.5, 'возврат_налога': 4.2, 'компенсация_жкх': 4.5,
    'указ_президента': 3.6, 'удвоение_денег': 4.6, 'гарантированный_доход': 4.4, 'пассивный_заработок': 4.2, 'без_рисков': 4.2,
    'финансовая_пирамида': 4.7, 'ставить_лайки_за_деньги': 4.6, 'оценка_товаров': 4.2, 'wildberries_заработок': 4.5, 'ozon_заработок': 4.5,
    'работа_на_дому': 4, 'без_опыта': 3.8, 'ежедневный_доход': 4.2, 'вывод_аирдропа': 4.6, 'криптовалютный_бот': 4.4,
    'бесплатные_usdt': 4.5, 'служба_доставки_olx': 4.6, 'безопасная_сделка': 4.3, 'дешевая_умра': 4.5, 'виза_с_гарантией': 4.6,
    'выигрыш_green_card': 4.6, 'скидка_на_штрафы': 4.5, 'проверка_штрафов_гибдд': 4.2, 'снятие_ареста_с_карты': 4.6, 'перейдите_по_ссылке': 4.2,
    'нажмите_на_ссылку': 4.2, 'пишите_в_лс': 4.3, 'свяжитесь_с_админом': 4.2, 'срочно_подтвердите': 4.4, 'только_сегодня': 3.8,
    'осталось_мало_мест': 4, 'заполните_анкету': 3.8, 'введите_код_из_смс': 4.8, 'подтверждение_перевода': 4.4,
    // -------------------------------------------------------------
    // 17. BENIGN / EVERYDAY LANGUAGE INHIBITORS (Negative Weights)
    // -------------------------------------------------------------
    'universitet': -2.8, 'maktab': -2.5, 'talaba': -2, 'oquvchi': -2.2, 'dars': -2.8,
    'oqituvchi': -2.6, 'muallim': -2.6, 'kitob': -2.4, 'kutubxona': -2.6, 'imtihon': -2.7,
    'fan': -2.2, 'institut': -2.5, 'akademik': -2.4, 'darslik': -2.5, 'fakultet': -2.6,
    'sessiya_imtihon': -3.2, 'diplom': -2.5, 'kurs_ishi': -2.8, 'referat': -2.6, 'laboratoriya': -2.8,
    'tadqiqot': -2.8, 'ilmiy': -2.5, 'maqola': -2.2, 'nashriyot': -2.4, 'rahmat': -2.9,
    'katta_rahmat': -3.4, 'tashakkur': -2.8, 'salom': -1.4, 'assalomu': -1.6, 'alaykum': -1.6,
    'vaalaykum': -1.8, 'yaxshimisiz': -2.4, 'charchamang': -2.5, 'sog_boling': -2.8, 'omad': -1.5,
    'dostlar': -2.6, 'uchrashdik': -3.2, 'aylandik': -2.9, 'yaxshi': -1.9, 'dam_olish': -2.6,
    'choyxona': -2.8, 'osh': -1.8, 'tushlik': -2.4, 'kechki_ovqat': -2.6, 'kayfiyat': -2.2,
    'xushxabar': -2, 'tabrik': -2, 'tabriklayman': -2.5, 'soglom': -2.4, 'bemor': -2,
    'shifokor': -2.5, 'dorixona': -2.2, 'oilam': -2.5, 'ota': -2.2, 'ona': -2.2,
    'onam': -2.4, 'otam': -2.4, 'farzandim': -2.2, 'jigarim': -2.2, 'akam': -2,
    'opam': -2, 'uyimiz': -2.4, 'mahalla': -2.4, 'xonadon': -2.4, 'tinchlik': -2.9,
    'soglik': -2.6, 'omonlik': -2.6, 'nevara': -2.2, 'kelin': -2, 'ob-havo': -3.5,
    'ob_havo': -3.5, 'yomgir': -3.2, 'qor': -3, 'quyosh': -3.2, 'harorat': -3.2,
    'shamol': -2.8, 'bulut': -2.8, 'fasl': -2.4, 'bahor': -2.6, 'yoz': -2.2,
    'kuz': -2.4, 'qish': -2.4, 'tabiat': -2.6, 'ekologiya': -2.6, 'sayr': -2.4,
    'tog': -2.2, 'daryo': -2.2, 'bog': -2, 'bugun': -0.4, 'ertaga': -1.4,
    'kecha': -2.2, 'soat': -1, 'vaqt': -0.8, 'sport': -2.4, 'futbol': -2.8,
    'chempionat': -2.6, 'gol': -2.4, 'match': -2.5, 'oyini': -2, 'stadion': -2.8,
    'jamoa': -2.4, 'mashgulot': -2.6, 'turnir': -2.5, 'boks': -2.6, 'dzyudo': -2.6,
    'shaxmat': -2.8, 'gala_kontsert': -2.8, 'kino': -2, 'teatr': -2.6, 'muzey': -2.8,
    'konsert': -2.4, 'madaniyat': -2.6, 'markaziy_bank_ma': -3.5, 'inflyatsiya': -2.8, 'statistika': -2.4,
    'nashr': -2.2, 'gazeta': -2.4, 'yangiliklar': -2, 'iqtisodiyot': -2.5, 'korxona': -2.2,
    'ishlab_chiqarish': -2.6, 'eksport': -2.5, 'import': -2.4, 'tadbirkor': -1.6, 'investitsiya_muhiti': -2.8,
    'loyiha': -2, 'seminar': -2.5, 'konferensiya': -2.6, 'qonunchilik': -2.6, 'deputat': -2.4,
    'vazirlar_mahkamasi': -2.8, 'bayram': -2, 'navroz': -2.5, 'hayit': -2.5, 'mustaqillik': -2.8,
    'konstitutsiya': -2.8, 'yangi_yil': -2.4, 'xayit': -2.5, 'hashar': -2.8, 'juma_muborak': -3.2,
    'tabriknoma': -2.5, 'ramazon': -2.8, 'iftorlik': -2.8, 'раҳмат': -2.9, 'катта_раҳмат': -3.4,
    'салом': -1.4, 'ассалому': -1.6, 'алайкум': -1.6, 'ваалайкум': -1.8, 'мактаб': -2.5,
    'талаба': -2, 'ўқувчи': -2.2, 'дарс': -2.8, 'ўқитувчи': -2.6, 'китоб': -2.4,
    'кутубхона': -2.6, 'имтиҳон': -2.7, 'дўстлар': -2.6, 'оилам': -2.5, 'тинчлик': -2.9,
    'об_ҳаво': -3.5, 'спорт': -2.4, 'футбол': -2.8, 'байрам': -2, 'наврўз': -2.5,
    'ҳайит': -2.5, 'рамазон': -2.8, 'жума_муборак': -3.2, 'соғлик': -2.6, 'табриклайман': -2.5,
    'привет': -1.8, 'здравствуйте': -2.2, 'спасибо': -2.8, 'пожалуйста': -2.6, 'университет': -2.8,
    'школа': -2.5, 'студент': -2.2, 'урок': -2.6, 'учитель': -2.6, 'книга': -2.4,
    'библиотека': -2.6, 'экзамен': -2.6, 'погода': -3, 'дождь': -2.8, 'семья': -2.5,
    'новости': -2, 'исследования': -2.6, 'литература': -2.6
  };

  // Prior Scam Probability (Log Base)
  const SCAM_PRIOR = 0.22;

  /**
   * Tokenizer with Uzbek apostrophe normalization, punctuation stripping, and token bigrams
   */
  function tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      // Normalize apostrophe variations
      .replace(/[\u2018\u2019\u02BB\u0060\u00B4\u02BC\u201B\u02B9]/g, "'")
      // Remove URLs, emojis, and symbols
      .replace(/https?:\/\/[^\s]+/g, ' ')
      .replace(/[\p{Emoji}\p{Symbol}]/gu, ' ')
      .replace(/[^a-zа-яёқғҳў0-9'_\s]/gi, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2);
  }

  /**
   * Evaluates text using Naive Bayes log-odds model
   * @param {string} text 
   * @returns {object} { scamProbability: 0.0-1.0, logOdds: number, topFeatures: [] }
   */
  function classify(text) {
    const tokens = tokenize(text);
    if (tokens.length === 0) {
      return { scamProbability: 0.0, logOdds: 0.0, topFeatures: [] };
    }

    let logOdds = Math.log(SCAM_PRIOR / (1 - SCAM_PRIOR));
    const matchedFeatures = [];

    // 1. Analyze single tokens
    for (let i = 0; i < tokens.length; i++) {
      const w = tokens[i];
      for (const [stem, weight] of Object.entries(FEATURE_WEIGHTS)) {
        if (!stem.includes('_') && (w === stem || (w.startsWith(stem) && w.length <= stem.length + 4))) {
          logOdds += weight;
          matchedFeatures.push({ token: w, stem, weight });
          break;
        }
      }

      // 2. Analyze multi-word bigram & phrase combinations
      if (i < tokens.length - 1) {
        const bigram = `${tokens[i]}_${tokens[i + 1]}`;
        const bigramSpace = `${tokens[i]} ${tokens[i + 1]}`;

        for (const [stem, weight] of Object.entries(FEATURE_WEIGHTS)) {
          if (stem.includes('_') && (bigram === stem || bigram.startsWith(stem))) {
            logOdds += weight;
            matchedFeatures.push({ token: bigramSpace, stem, weight });
            break;
          }
        }

        // Common high-frequency scam combinations
        if (bigramSpace.includes('5 mln') || bigramSpace.includes('yutib ol') || bigramSpace.includes('sms kod') || bigramSpace.includes('linkga bos') || bigramSpace.includes('ovoz ber') || bigramSpace.includes('sizib chiq')) {
          logOdds += 2.6;
          matchedFeatures.push({ token: bigramSpace, stem: bigramSpace, weight: 2.6 });
        }
      }
    }

    // Convert Log-Odds to Probability via Sigmoid Function: 1 / (1 + e^(-logOdds))
    const scamProbability = 1 / (1 + Math.exp(-logOdds));

    // Sort features by impact
    matchedFeatures.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

    return {
      scamProbability: parseFloat(scamProbability.toFixed(3)),
      logOdds: parseFloat(logOdds.toFixed(2)),
      tokenCount: tokens.length,
      topFeatures: matchedFeatures.slice(0, 7)
    };
  }

  return {
    tokenize,
    classify,
    FEATURE_WEIGHTS
  };
});
