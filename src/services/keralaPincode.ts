/**
 * Kerala PIN Code & Place Identification Service
 * Identifies village/town/city, taluk, district, post offices, and delivery speed
 * by any 6-digit Kerala postal PIN code.
 *
 * Supports:
 * 1. Authoritative real-time India Post API lookup (https://api.postalpincode.in/pincode/{pincode})
 * 2. Instant client-side caching (localStorage + memory)
 * 3. Comprehensive offline Kerala Postal Knowledge Base across all 14 districts
 * 4. Algorithmic postal series resolution for every Kerala postal prefix (670xxx - 695xxx)
 */

export interface PostOfficeDetail {
  Name: string;
  Description?: string;
  BranchType?: string;
  DeliveryStatus?: string;
  Circle?: string;
  District?: string;
  Division?: string;
  Region?: string;
  Block?: string;
  State?: string;
  Country?: string;
  Pincode?: string;
}

export interface KeralaPlaceInfo {
  pincode: string;
  placeName: string;
  district: string;
  districtMalayalam?: string;
  talukOrBlock?: string;
  postalDivision?: string;
  postOffices: string[];
  isKerala: boolean;
  isServiceable: boolean;
  deliverySpeed: 'Same Day' | 'Next Day (24h)' | '1-2 Days' | '2-3 Days';
  estimatedDays: number;
  standardFee: number;
  expressAvailable: boolean;
  expressFee: number;
  codAvailable: boolean;
  freeDeliveryThreshold: number;
  source: 'api' | 'cache' | 'offline_database' | 'postal_series';
}

// Malayalam district names mapping
export const KERALA_DISTRICTS_ML: Record<string, string> = {
  'Thiruvananthapuram': 'തിരുവനന്തപുരം',
  'Kollam': 'കൊല്ലം',
  'Pathanamthitta': 'പത്തനംതിട്ട',
  'Alappuzha': 'ആലപ്പുഴ',
  'Kottayam': 'കോട്ടയം',
  'Idukki': 'ഇടുക്കി',
  'Ernakulam': 'എറണാകുളം',
  'Thrissur': 'തൃശ്ശൂർ',
  'Palakkad': 'പാലക്കാട്',
  'Malappuram': 'മലപ്പുറം',
  'Kozhikode': 'കോഴിക്കോട്',
  'Wayanad': 'വയനാട്',
  'Kannur': 'കണ്ണൂർ',
  'Kasaragod': 'കാസർഗോഡ്',
};

// Comprehensive Built-in Kerala PIN Code Database
export const KERALA_PINCODE_DATABASE: Record<string, {
  placeName: string;
  district: string;
  taluk: string;
  division: string;
  postOffices: string[];
  express: boolean;
  estDays: number;
  speed: 'Same Day' | 'Next Day (24h)' | '1-2 Days' | '2-3 Days';
}> = {
  // ERNAKULAM (682xxx, 683xxx, 686xxx)
  '682001': { placeName: 'Fort Kochi / Mattancherry', district: 'Ernakulam', taluk: 'Kochi', division: 'Ernakulam', postOffices: ['Fort Kochi HO', 'Mattancherry SO', 'Bazaar SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682002': { placeName: 'Mattancherry Town', district: 'Ernakulam', taluk: 'Kochi', division: 'Ernakulam', postOffices: ['Mattancherry SO', 'Jew Town BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682003': { placeName: 'Aluva Bazar / Willingdon Island', district: 'Ernakulam', taluk: 'Kochi', division: 'Ernakulam', postOffices: ['Willingdon Island SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682005': { placeName: 'Rameswaram / Thoppumpady', district: 'Ernakulam', taluk: 'Kochi', division: 'Ernakulam', postOffices: ['Thoppumpady SO', 'Chullickal BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682006': { placeName: 'Palluruthy / Kumbalangi', district: 'Ernakulam', taluk: 'Kochi', division: 'Ernakulam', postOffices: ['Palluruthy SO', 'Kumbalangi SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682011': { placeName: 'Kaloor / Kathrikadavu', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Kaloor SO', 'Kathrikadavu SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682016': { placeName: 'Marine Drive / High Court / Broadway', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Ernakulam College SO', 'Shanmugham Road SO', 'High Court SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682017': { placeName: 'Kaloor Stadium / Palarivattom', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Kaloor SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682018': { placeName: 'Ernakulam South / Panampilly West', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Ernakulam South SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682020': { placeName: 'Panampilly Nagar / Kadavanthra', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Panampilly Nagar SO', 'Kadavanthra SO', 'Girinagar BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682021': { placeName: 'Thevara / Sacred Heart / Cochin Shipyard', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Thevara SO', 'Shipyard SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682024': { placeName: 'Kalamassery / CUSAT Tech Zone', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Aluva', postOffices: ['Kalamassery SO', 'CUSAT SO', 'HMT Colony SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682025': { placeName: 'Edappally / Lulu Mall Corridor', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Edappally SO', 'Edappally North SO', 'Toll Junction BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682028': { placeName: 'Palarivattom / Thammanam', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Palarivattom SO', 'Thammanam SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682030': { placeName: 'Kakkanad / Infopark / SmartCity', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Aluva', postOffices: ['Kakkanad SO', 'Infopark SO', 'Civil Station Ernakulam SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682031': { placeName: 'Tripunithura / Hill Palace', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Tripunithura SO', 'Statue Junction BO', 'Thiruvankulam SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682036': { placeName: 'Vyttila Mobility Hub / Elamkulam', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Vyttila SO', 'Elamkulam SO', 'Janatha BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682037': { placeName: 'Vennala / Padivattom', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Vennala SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '682042': { placeName: 'Kaloor Reserve / Elamakkara', district: 'Ernakulam', taluk: 'Kanayannur', division: 'Ernakulam', postOffices: ['Elamakkara SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '683101': { placeName: 'Aluva Town / Periyar Bank', district: 'Ernakulam', taluk: 'Aluva', division: 'Aluva', postOffices: ['Aluva HO', 'Bank Junction SO', 'Market SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '683102': { placeName: 'Aluva Settlement / UC College', district: 'Ernakulam', taluk: 'Aluva', division: 'Aluva', postOffices: ['UC College SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '683513': { placeName: 'North Paravur / Cherai Gateway', district: 'Ernakulam', taluk: 'Paravur', division: 'Aluva', postOffices: ['Paravur Town SO', 'Koonammavu SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '683572': { placeName: 'Angamaly / Cochin International Airport (COK)', district: 'Ernakulam', taluk: 'Aluva', division: 'Aluva', postOffices: ['Angamaly SO', 'Nedumbassery SO', 'CIAL BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '683544': { placeName: 'Perumbavoor Town', district: 'Ernakulam', taluk: 'Kunnathunad', division: 'Aluva', postOffices: ['Perumbavoor SO', 'AM Road SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '686662': { placeName: 'Muvattupuzha Town / MC Road', district: 'Ernakulam', taluk: 'Muvattupuzha', division: 'Aluva', postOffices: ['Muvattupuzha HO', 'Velloorkunnam SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '686691': { placeName: 'Kothamangalam / High Range Gateway', district: 'Ernakulam', taluk: 'Kothamangalam', division: 'Aluva', postOffices: ['Kothamangalam SO', 'MA College SO'], express: true, estDays: 2, speed: '1-2 Days' },

  // THIRUVANANTHAPURAM (695xxx)
  '695001': { placeName: 'Trivandrum Central / Statue / Secretariat', district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', division: 'Trivandrum North', postOffices: ['Trivandrum GPO', 'Statue SO', 'Pulimoodu SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '695002': { placeName: 'Chalai Bazaar / East Fort', district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', division: 'Trivandrum South', postOffices: ['Chalai SO', 'Attakulangara BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '695003': { placeName: 'Vikas Bhavan / Palayam / University', district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', division: 'Trivandrum North', postOffices: ['Palayam SO', 'University College SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '695004': { placeName: 'Vazhuthacaud / Kowdiar Palace Area', district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', division: 'Trivandrum North', postOffices: ['Vazhuthacaud SO', 'Thycaud SO', 'Kowdiar SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '695005': { placeName: 'Sasthamangalam / Vellayambalam', district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', division: 'Trivandrum North', postOffices: ['Sasthamangalam SO', 'Vellayambalam SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '695011': { placeName: 'Pattom / Medical College Campus', district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', division: 'Trivandrum North', postOffices: ['Pattom Palace SO', 'Trivandrum Medical College SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '695014': { placeName: 'Thampanoor Railway Central', district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', division: 'Trivandrum South', postOffices: ['Thampanoor SO', 'Railway Station RMS'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '695024': { placeName: 'Pappanamcode / Nemom', district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', division: 'Trivandrum South', postOffices: ['Pappanamcode SO', 'Nemom SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '695033': { placeName: 'Kazhakkoottam / Technopark Hub', district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', division: 'Trivandrum North', postOffices: ['Kazhakkoottam SO', 'Technopark SO', 'Kariavattom SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '695581': { placeName: 'Technocity / Pallippuram', district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', division: 'Trivandrum North', postOffices: ['Pallippuram SO', 'Andoorkonam BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '695527': { placeName: 'Kovalam Beach / Vizhinjam Seaport', district: 'Thiruvananthapuram', taluk: 'Neyyattinkara', division: 'Trivandrum South', postOffices: ['Kovalam SO', 'Vizhinjam SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '695141': { placeName: 'Varkala Cliff / Sivagiri Mutt', district: 'Thiruvananthapuram', taluk: 'Varkala', division: 'Trivandrum North', postOffices: ['Varkala SO', 'Janardhanapuram SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '695121': { placeName: 'Neyyattinkara Town', district: 'Thiruvananthapuram', taluk: 'Neyyattinkara', division: 'Trivandrum South', postOffices: ['Neyyattinkara HO', 'Alummoodu SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '695541': { placeName: 'Nedumangad Town', district: 'Thiruvananthapuram', taluk: 'Nedumangad', division: 'Trivandrum North', postOffices: ['Nedumangad SO', 'Valicode BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '695101': { placeName: 'Attingal Municipal Town', district: 'Thiruvananthapuram', taluk: 'Chirayinkeezhu', division: 'Trivandrum North', postOffices: ['Attingal HO', 'Kacheri SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },

  // KOZHIKODE / CALICUT (673xxx)
  '673001': { placeName: 'Calicut Beach / Mananchira / Head Post Office', district: 'Kozhikode', taluk: 'Kozhikode', division: 'Calicut', postOffices: ['Calicut HO', 'Beach SO', 'Mananchira SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '673002': { placeName: 'Chalappuram / Puthiyara', district: 'Kozhikode', taluk: 'Kozhikode', division: 'Calicut', postOffices: ['Chalappuram SO', 'Puthiyara SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '673004': { placeName: 'Mavoor Road / Arayidathupalam', district: 'Kozhikode', taluk: 'Kozhikode', division: 'Calicut', postOffices: ['Kozhikode Town SO', 'Mavoor Road SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '673006': { placeName: 'Nadakkavu / West Hill', district: 'Kozhikode', taluk: 'Kozhikode', division: 'Calicut', postOffices: ['Nadakkavu SO', 'West Hill SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '673008': { placeName: 'Govt. Medical College Calicut', district: 'Kozhikode', taluk: 'Kozhikode', division: 'Calicut', postOffices: ['Calicut Medical College SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '673016': { placeName: 'Pantheerankavu / Cyberpark Calicut', district: 'Kozhikode', taluk: 'Kozhikode', division: 'Calicut', postOffices: ['Pantheerankavu SO', 'Cyberpark SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '673028': { placeName: 'Beypore Port / Chaliyam', district: 'Kozhikode', taluk: 'Kozhikode', division: 'Calicut', postOffices: ['Beypore SO', 'Chaliyam SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '673101': { placeName: 'Vatakara Town / Vadakara Port', district: 'Kozhikode', taluk: 'Vadakara', division: 'Vadakara', postOffices: ['Vadakara HO', 'Kuttiady Road SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '673307': { placeName: 'Koyilandy / Quilandy Town', district: 'Kozhikode', taluk: 'Koyilandy', division: 'Vadakara', postOffices: ['Koyilandy SO', 'Kollam BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '673571': { placeName: 'Koduvally / Gold Hub', district: 'Kozhikode', taluk: 'Thamarassery', division: 'Calicut', postOffices: ['Koduvally SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '673572': { placeName: 'Thamarassery / Ghat Road Gateway', district: 'Kozhikode', taluk: 'Thamarassery', division: 'Calicut', postOffices: ['Thamarassery SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '673601': { placeName: 'Ramanattukara / Feroke Ceramic Hub', district: 'Kozhikode', taluk: 'Kozhikode', division: 'Calicut', postOffices: ['Feroke SO', 'Ramanattukara SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },

  // THRISSUR (680xxx)
  '680001': { placeName: 'Swaraj Round / City Center / Thrissur HO', district: 'Thrissur', taluk: 'Thrissur', division: 'Thrissur', postOffices: ['Thrissur HO', 'Round South SO', 'Thekkinkadu BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '680003': { placeName: 'Chembookavu / Zoo Area', district: 'Thrissur', taluk: 'Thrissur', division: 'Thrissur', postOffices: ['Chembookavu SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '680004': { placeName: 'Ayyanthole / Collectorate Civil Station', district: 'Thrissur', taluk: 'Thrissur', division: 'Thrissur', postOffices: ['Ayyanthole SO', 'Civil Station SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '680005': { placeName: 'Ollur / Industrial Estate', district: 'Thrissur', taluk: 'Thrissur', division: 'Thrissur', postOffices: ['Ollur SO', 'Marathakkara BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '680020': { placeName: 'Amalanagar / Medical College', district: 'Thrissur', taluk: 'Thrissur', division: 'Thrissur', postOffices: ['Amalanagar SO', 'Puzhakkal BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '680101': { placeName: 'Guruvayur Temple Town', district: 'Thrissur', taluk: 'Chavakkad', division: 'Irinjalakuda', postOffices: ['Guruvayur SO', 'East Nada BO', 'Mammiyoor BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '680121': { placeName: 'Chavakkad Beach / Town', district: 'Thrissur', taluk: 'Chavakkad', division: 'Irinjalakuda', postOffices: ['Chavakkad SO', 'Blangad BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '680306': { placeName: 'Irinjalakuda Town / Koodalmanikyam', district: 'Thrissur', taluk: 'Mukundapuram', division: 'Irinjalakuda', postOffices: ['Irinjalakuda HO', 'Tana SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '680567': { placeName: 'Kunnamkulam Market / Press Hub', district: 'Thrissur', taluk: 'Kunnamkulam', division: 'Thrissur', postOffices: ['Kunnamkulam SO', 'Kanippayyur SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '680664': { placeName: 'Chalakudy Town / Athirappilly Gateway', district: 'Thrissur', taluk: 'Chalakudy', division: 'Irinjalakuda', postOffices: ['Chalakudy SO', 'Railway Station SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '680681': { placeName: 'Kodungallur / Muziris Heritage', district: 'Thrissur', taluk: 'Kodungallur', division: 'Irinjalakuda', postOffices: ['Kodungallur SO', 'Kottappuram SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },

  // KANNUR (670xxx)
  '670001': { placeName: 'Kannur Town / Payyambalam / Fort St. Angelo', district: 'Kannur', taluk: 'Kannur', division: 'Kannur', postOffices: ['Kannur HO', 'Camp Bazaar SO', 'Payyambalam SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '670002': { placeName: 'Burnacherry / Cantonment', district: 'Kannur', taluk: 'Kannur', division: 'Kannur', postOffices: ['Burnacherry SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '670003': { placeName: 'Pallikkunnu / Chalad', district: 'Kannur', taluk: 'Kannur', division: 'Kannur', postOffices: ['Pallikkunnu SO', 'Chalad SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '670101': { placeName: 'Thalassery / Tellicherry Fort & Port', district: 'Kannur', taluk: 'Thalassery', division: 'Thalassery', postOffices: ['Thalassery HO', 'Pilakool SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '670141': { placeName: 'Mattannur / Kannur Int. Airport (CNN)', district: 'Kannur', taluk: 'Thalassery', division: 'Thalassery', postOffices: ['Mattannur SO', 'Airport BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '670307': { placeName: 'Payyanur Sub-Division', district: 'Kannur', taluk: 'Payyanur', division: 'Kannur', postOffices: ['Payyanur SO', 'Perumba SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '670671': { placeName: 'Taliparamba / Rajarajeshwara Temple', district: 'Kannur', taluk: 'Taliparamba', division: 'Kannur', postOffices: ['Taliparamba SO', 'Kalliaseri SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '670702': { placeName: 'Iritty / Coorg Highway Junction', district: 'Kannur', taluk: 'Iritty', division: 'Thalassery', postOffices: ['Iritty SO', 'Ulikkal BO'], express: true, estDays: 2, speed: '1-2 Days' },

  // MALAPPURAM (676xxx, 679xxx)
  '676505': { placeName: 'Malappuram Civil Station / Collectorate', district: 'Malappuram', taluk: 'Malappuram', division: 'Manjeri', postOffices: ['Malappuram SO', 'Civil Station SO', 'Up Hill SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '676101': { placeName: 'Manjeri Town / Govt Medical College', district: 'Malappuram', taluk: 'Ernad', division: 'Manjeri', postOffices: ['Manjeri HO', 'Court Road SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '676121': { placeName: 'Tirur Town / Thunchan Memorial', district: 'Malappuram', taluk: 'Tirur', division: 'Tirur', postOffices: ['Tirur HO', 'Alathiyur BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '676503': { placeName: 'Kondotty / Calicut Airport Gateway (CCJ)', district: 'Malappuram', taluk: 'Kondotty', division: 'Manjeri', postOffices: ['Kondotty SO', 'Airport Junction BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '676517': { placeName: 'Kottakkal / Arya Vaidya Sala Ayurvedic Center', district: 'Malappuram', taluk: 'Tirur', division: 'Tirur', postOffices: ['Kottakkal SO', 'Changuvetty BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '679322': { placeName: 'Perinthalmanna / Angadipuram Temple', district: 'Malappuram', taluk: 'Perinthalmanna', division: 'Manjeri', postOffices: ['Perinthalmanna SO', 'Angadipuram SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '679329': { placeName: 'Nilambur Teak City / Forest Division', district: 'Malappuram', taluk: 'Nilambur', division: 'Manjeri', postOffices: ['Nilambur SO', 'Chandakkunnu BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '679577': { placeName: 'Ponnani Port / Coastal Belt', district: 'Malappuram', taluk: 'Ponnani', division: 'Tirur', postOffices: ['Ponnani SO', 'Ponnani Nagaram SO'], express: true, estDays: 2, speed: '1-2 Days' },

  // KOLLAM (691xxx, 690xxx)
  '691001': { placeName: 'Kollam Beach / Chinnakada / Port', district: 'Kollam', taluk: 'Kollam', division: 'Kollam', postOffices: ['Kollam HO', 'Chinnakada SO', 'Beach Road BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '691008': { placeName: 'Asramam / Adventure Park', district: 'Kollam', taluk: 'Kollam', division: 'Kollam', postOffices: ['Asramam SO', 'Uliyakkovil BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '691013': { placeName: 'Kilikollur / Cashew Industrial Corridor', district: 'Kollam', taluk: 'Kollam', division: 'Kollam', postOffices: ['Kilikollur SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '690518': { placeName: 'Karunagappally Town / High School Junction', district: 'Kollam', taluk: 'Karunagappally', division: 'Kollam', postOffices: ['Karunagappally SO', 'Maruthoorkulangara BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '691506': { placeName: 'Kottarakkara / Ganapathy Temple', district: 'Kollam', taluk: 'Kottarakkara', division: 'Kollam', postOffices: ['Kottarakkara SO', 'Pulamon BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '691305': { placeName: 'Punalur / Suspension Bridge Town', district: 'Kollam', taluk: 'Punalur', division: 'Kollam', postOffices: ['Punalur SO', 'Paper Mills BO'], express: true, estDays: 2, speed: '1-2 Days' },

  // ALAPPUZHA (688xxx, 689xxx, 690xxx)
  '688001': { placeName: 'Alappuzha Town / Backwaters / Finishing Point', district: 'Alappuzha', taluk: 'Ambalappuzha', division: 'Alappuzha', postOffices: ['Alappuzha HO', 'Vazhicherry SO', 'Cullen Road BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '688011': { placeName: 'Mullakkal / Boat Jetty / Kidangamparampu', district: 'Alappuzha', taluk: 'Ambalappuzha', division: 'Alappuzha', postOffices: ['Mullakkal SO', 'Thathampally BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '688524': { placeName: 'Cherthala Town / Infopark Cherthala', district: 'Alappuzha', taluk: 'Cherthala', division: 'Alappuzha', postOffices: ['Cherthala SO', 'KSEB Junction BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '688561': { placeName: 'Mararikulam / Coastal Fishery Village', district: 'Alappuzha', taluk: 'Cherthala', division: 'Alappuzha', postOffices: ['Mararikulam North SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '690502': { placeName: 'Kayamkulam Town / Krishnapuram Palace', district: 'Alappuzha', taluk: 'Karthikappally', division: 'Mavelikkara', postOffices: ['Kayamkulam HO', 'KPAC Junction BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '689121': { placeName: 'Chengannur / Sabarimala Railway Gateway', district: 'Alappuzha', taluk: 'Chengannur', division: 'Tiruvalla', postOffices: ['Chengannur SO', 'Railway Station SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '690101': { placeName: 'Mavelikkara / Raja Ravi Varma Arts Hub', district: 'Alappuzha', taluk: 'Mavelikkara', division: 'Mavelikkara', postOffices: ['Mavelikkara HO', 'Pandarathil Junction BO'], express: true, estDays: 2, speed: '1-2 Days' },

  // PALAKKAD (678xxx, 679xxx)
  '678001': { placeName: 'Palakkad Fort / Robinson Road / Sultanpet', district: 'Palakkad', taluk: 'Palakkad', division: 'Palakkad', postOffices: ['Palakkad HO', 'Sultanpet SO', 'Fort Maidan BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '678009': { placeName: 'Olavakkode Railway Junction', district: 'Palakkad', taluk: 'Palakkad', division: 'Palakkad', postOffices: ['Olavakkode SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '678621': { placeName: 'Kanjikode Industrial Hub / IIT Palakkad', district: 'Palakkad', taluk: 'Palakkad', division: 'Palakkad', postOffices: ['Kanjikode SO', 'IIT Campus BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '679101': { placeName: 'Ottapalam Town / Bharatapuzha Bank', district: 'Palakkad', taluk: 'Ottapalam', division: 'Ottapalam', postOffices: ['Ottapalam HO', 'East Ottapalam SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '679121': { placeName: 'Shoranur Junction / Kerala Kalamandalam Gateway', district: 'Palakkad', taluk: 'Ottapalam', division: 'Ottapalam', postOffices: ['Shoranur SO', 'Kulappully BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '679303': { placeName: 'Pattambi Town / Sanskrit College Zone', district: 'Palakkad', taluk: 'Pattambi', division: 'Ottapalam', postOffices: ['Pattambi SO', 'Mele Pattambi BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '678582': { placeName: 'Mannarkkad / Silent Valley Gateway', district: 'Palakkad', taluk: 'Mannarkkad', division: 'Palakkad', postOffices: ['Mannarkkad SO'], express: true, estDays: 2, speed: '1-2 Days' },

  // KOTTAYAM (686xxx)
  '686001': { placeName: 'Kottayam Town / Thirunakkara / Collectorate', district: 'Kottayam', taluk: 'Kottayam', division: 'Kottayam', postOffices: ['Kottayam HO', 'Thirunakkara SO', 'Collectorate SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '686008': { placeName: 'Kumarakom / Lake Vembanad Resorts', district: 'Kottayam', taluk: 'Kottayam', division: 'Kottayam', postOffices: ['Kumarakom SO', 'Attamangalam BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '686016': { placeName: 'Gandhi Nagar / Medical College Kottayam', district: 'Kottayam', taluk: 'Kottayam', division: 'Kottayam', postOffices: ['Gandhi Nagar SO', 'Medical College SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '686561': { placeName: 'Pala Town / Meenachil Valley', district: 'Kottayam', taluk: 'Meenachil', division: 'Kottayam', postOffices: ['Pala HO', 'Main Road SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '686532': { placeName: 'Changanassery Town / Market Junction', district: 'Kottayam', taluk: 'Changanassery', division: 'Changanassery', postOffices: ['Changanassery HO', 'Perunna SO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '686574': { placeName: 'Kanjirappally / Plantation Zone', district: 'Kottayam', taluk: 'Kanjirappally', division: 'Changanassery', postOffices: ['Kanjirappally SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '686631': { placeName: 'Vaikom Temple Town / Lakefront', district: 'Kottayam', taluk: 'Vaikom', division: 'Kottayam', postOffices: ['Vaikom SO', 'West Gate BO'], express: true, estDays: 2, speed: '1-2 Days' },

  // KASARAGOD (671xxx)
  '671121': { placeName: 'Kasaragod Town / Vidyanagar / Central Hub', district: 'Kasaragod', taluk: 'Kasaragod', division: 'Kasaragod', postOffices: ['Kasaragod HO', 'Vidyanagar SO', 'Nullippady BO'], express: true, estDays: 2, speed: '2-3 Days' },
  '671315': { placeName: 'Kanhangad Town / Kotikulam', district: 'Kasaragod', taluk: 'Hosdurg', division: 'Kasaragod', postOffices: ['Kanhangad HO', 'Kanhangad South SO'], express: true, estDays: 2, speed: '2-3 Days' },
  '671316': { placeName: 'Nileshwaram / Cultural Heritage Capital', district: 'Kasaragod', taluk: 'Hosdurg', division: 'Kasaragod', postOffices: ['Nileshwar SO'], express: true, estDays: 2, speed: '2-3 Days' },
  '671314': { placeName: 'Bekal Fort / Pallikere Coast', district: 'Kasaragod', taluk: 'Hosdurg', division: 'Kasaragod', postOffices: ['Pallikere SO', 'Bekal BO'], express: true, estDays: 2, speed: '2-3 Days' },
  '671321': { placeName: 'Cheruvathur / Chandragiri Valley', district: 'Kasaragod', taluk: 'Hosdurg', division: 'Kasaragod', postOffices: ['Cheruvathur SO'], express: true, estDays: 2, speed: '2-3 Days' },

  // PATHANAMTHITTA (689xxx, 691xxx)
  '689645': { placeName: 'Pathanamthitta Town / District HQ / Ring Road', district: 'Pathanamthitta', taluk: 'Kozhencherry', division: 'Pathanamthitta', postOffices: ['Pathanamthitta HO', 'College Road SO'], express: true, estDays: 2, speed: '1-2 Days' },
  '689101': { placeName: 'Thiruvalla Town / SCS Junction', district: 'Pathanamthitta', taluk: 'Thiruvalla', division: 'Tiruvalla', postOffices: ['Tiruvalla HO', 'Market SO', 'Cross Junction BO'], express: true, estDays: 1, speed: 'Next Day (24h)' },
  '691523': { placeName: 'Adoor Town / Central Travancore Junction', district: 'Pathanamthitta', taluk: 'Adoor', division: 'Pathanamthitta', postOffices: ['Adoor SO', 'Kannamkode BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '689672': { placeName: 'Ranni / Sabarimala Base Foothills', district: 'Pathanamthitta', taluk: 'Ranni', division: 'Pathanamthitta', postOffices: ['Ranni SO', 'Pazhavangadi BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '689501': { placeName: 'Pandalam Palace / Ayyappa Temple', district: 'Pathanamthitta', taluk: 'Adoor', division: 'Pathanamthitta', postOffices: ['Pandalam SO'], express: true, estDays: 2, speed: '1-2 Days' },

  // IDUKKI (685xxx)
  '685612': { placeName: 'Munnar Town / Tea Garden High Range', district: 'Idukki', taluk: 'Devikulam', division: 'Idukki', postOffices: ['Munnar SO', 'Old Munnar BO', 'Mattupetty BO'], express: false, estDays: 3, speed: '2-3 Days' },
  '685584': { placeName: 'Thodupuzha Town / Commercial Hub', district: 'Idukki', taluk: 'Thodupuzha', division: 'Idukki', postOffices: ['Thodupuzha HO', 'Mangattukavala SO', 'Vengalloor BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '685508': { placeName: 'Kattappana Cardamom Market', district: 'Idukki', taluk: 'Udumbanchola', division: 'Idukki', postOffices: ['Kattappana SO'], express: false, estDays: 3, speed: '2-3 Days' },
  '685531': { placeName: 'Adimali / High Range Corridor', district: 'Idukki', taluk: 'Devikulam', division: 'Idukki', postOffices: ['Adimali SO'], express: false, estDays: 3, speed: '2-3 Days' },
  '685609': { placeName: 'Kumily / Thekkady Periyar Wildlife Sanctuary', district: 'Idukki', taluk: 'Peermade', division: 'Idukki', postOffices: ['Kumily SO', 'Thekkady BO'], express: false, estDays: 3, speed: '2-3 Days' },

  // WAYANAD (673xxx)
  '673121': { placeName: 'Kalpetta Town / Wayanad District HQ', district: 'Wayanad', taluk: 'Vythiri', division: 'Calicut', postOffices: ['Kalpetta SO', 'Civil Station SO', 'Munderi BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '673592': { placeName: 'Sulthan Bathery Town / Edakkal Caves', district: 'Wayanad', taluk: 'Sulthan Bathery', division: 'Calicut', postOffices: ['Sulthan Bathery SO', 'Kuppadi BO'], express: true, estDays: 2, speed: '1-2 Days' },
  '673545': { placeName: 'Mananthavady Town / Valliyoorkavu', district: 'Wayanad', taluk: 'Mananthavady', division: 'Calicut', postOffices: ['Mananthavady SO', 'Thonichal BO'], express: true, estDays: 2, speed: '2-3 Days' },
  '673577': { placeName: 'Meppadi / Chembra Peak Hills', district: 'Wayanad', taluk: 'Vythiri', division: 'Calicut', postOffices: ['Meppadi SO'], express: false, estDays: 2, speed: '1-2 Days' },
  '673576': { placeName: 'Vythiri Rainforest / Lakkidi Gateway', district: 'Wayanad', taluk: 'Vythiri', division: 'Calicut', postOffices: ['Vythiri SO'], express: false, estDays: 2, speed: '1-2 Days' },
};

// Algorithmic fallback by 3-digit prefix for ANY valid Kerala PIN (670000 - 695999)
export function getKeralaDistrictByPrefix(pinPrefix3: string): { district: string; defaultArea: string; estDays: number } {
  const prefix = pinPrefix3.substring(0, 3);
  switch (prefix) {
    case '682':
      return { district: 'Ernakulam', defaultArea: 'Greater Kochi Metropolitan Area', estDays: 1 };
    case '683':
      return { district: 'Ernakulam', defaultArea: 'Aluva / Angamaly / Paravur Zone', estDays: 1 };
    case '695':
      return { district: 'Thiruvananthapuram', defaultArea: 'Thiruvananthapuram Capital Region', estDays: 1 };
    case '673':
      return { district: 'Kozhikode', defaultArea: 'Kozhikode / Malabar Coastal Region', estDays: 2 };
    case '680':
      return { district: 'Thrissur', defaultArea: 'Thrissur Cultural Capital Region', estDays: 1 };
    case '670':
      return { district: 'Kannur', defaultArea: 'Kannur North Malabar Hub', estDays: 2 };
    case '671':
      return { district: 'Kasaragod', defaultArea: 'Kasaragod Northern District Hub', estDays: 2 };
    case '676':
      return { district: 'Malappuram', defaultArea: 'Malappuram Central Region', estDays: 2 };
    case '678':
      return { district: 'Palakkad', defaultArea: 'Palakkad District Gateway', estDays: 1 };
    case '679':
      return { district: 'Palakkad', defaultArea: 'Palakkad / Shoranur / South Malappuram Hub', estDays: 2 };
    case '685':
      return { district: 'Idukki', defaultArea: 'Idukki High Range Hills', estDays: 3 };
    case '686':
      return { district: 'Kottayam', defaultArea: 'Kottayam Central Travancore', estDays: 1 };
    case '688':
      return { district: 'Alappuzha', defaultArea: 'Alappuzha Backwater Coastal Region', estDays: 1 };
    case '689':
      return { district: 'Pathanamthitta', defaultArea: 'Pathanamthitta Central Hub', estDays: 2 };
    case '690':
      return { district: 'Kollam', defaultArea: 'Kollam / Kayamkulam Border Region', estDays: 2 };
    case '691':
      return { district: 'Kollam', defaultArea: 'Kollam Port & Cashew District Hub', estDays: 1 };
    default:
      return { district: 'Ernakulam', defaultArea: 'Kerala Regional Delivery Hub', estDays: 2 };
  }
}

// In-memory cache for API responses during the app session
const MEMORY_CACHE = new Map<string, KeralaPlaceInfo>();

/**
 * Validates if the 6-digit pin code is in Kerala's postal series (670000 - 695999)
 */
export function isKeralaPostalRange(pincode: string): boolean {
  const num = parseInt(pincode.trim(), 10);
  return !isNaN(num) && num >= 670000 && num <= 695999;
}

/**
 * Synchronous local place lookup (instant, zero delay, works 100% offline)
 */
export function lookupKeralaPincodeSync(pincode: string): KeralaPlaceInfo | null {
  const cleaned = pincode.trim();
  if (!/^\d{6}$/.test(cleaned)) return null;

  // Check memory cache first
  if (MEMORY_CACHE.has(cleaned)) {
    return MEMORY_CACHE.get(cleaned)!;
  }

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(`nexdrop_pin_${cleaned}`);
    if (cached) {
      const parsed = JSON.parse(cached) as KeralaPlaceInfo;
      MEMORY_CACHE.set(cleaned, parsed);
      return parsed;
    }
  } catch (e) {
    // Ignore storage issues
  }

  // Check hardcoded dictionary
  if (KERALA_PINCODE_DATABASE[cleaned]) {
    const entry = KERALA_PINCODE_DATABASE[cleaned];
    const info: KeralaPlaceInfo = {
      pincode: cleaned,
      placeName: entry.placeName,
      district: entry.district,
      districtMalayalam: KERALA_DISTRICTS_ML[entry.district] || entry.district,
      talukOrBlock: entry.taluk,
      postalDivision: entry.division,
      postOffices: entry.postOffices,
      isKerala: true,
      isServiceable: true,
      deliverySpeed: entry.speed,
      estimatedDays: entry.estDays,
      standardFee: entry.estDays === 1 ? 40 : 50,
      expressAvailable: entry.express,
      expressFee: entry.express ? 80 : 120,
      codAvailable: true,
      freeDeliveryThreshold: 499,
      source: 'offline_database',
    };
    MEMORY_CACHE.set(cleaned, info);
    return info;
  }

  // If in Kerala postal series, provide algorithmic fallback
  if (isKeralaPostalRange(cleaned)) {
    const fallback = getKeralaDistrictByPrefix(cleaned);
    const info: KeralaPlaceInfo = {
      pincode: cleaned,
      placeName: fallback.defaultArea,
      district: fallback.district,
      districtMalayalam: KERALA_DISTRICTS_ML[fallback.district],
      talukOrBlock: fallback.district,
      postalDivision: `${fallback.district} Postal Division`,
      postOffices: [`${fallback.district} Sub-Post Office (${cleaned})`],
      isKerala: true,
      isServiceable: true,
      deliverySpeed: fallback.estDays === 1 ? 'Next Day (24h)' : (fallback.estDays === 2 ? '1-2 Days' : '2-3 Days'),
      estimatedDays: fallback.estDays,
      standardFee: 50,
      expressAvailable: fallback.estDays <= 2,
      expressFee: 95,
      codAvailable: true,
      freeDeliveryThreshold: 599,
      source: 'postal_series',
    };
    return info;
  }

  // Not in Kerala range
  return {
    pincode: cleaned,
    placeName: 'Outside Kerala Region',
    district: 'Non-Kerala',
    postOffices: [],
    isKerala: false,
    isServiceable: false,
    deliverySpeed: '2-3 Days',
    estimatedDays: 5,
    standardFee: 120,
    expressAvailable: false,
    expressFee: 200,
    codAvailable: false,
    freeDeliveryThreshold: 1499,
    source: 'postal_series',
  };
}

/**
 * Asynchronous lookup: queries India Post official public API (https://api.postalpincode.in)
 * with graceful instant fallback to the local Kerala database.
 */
export async function lookupKeralaPincode(pincode: string): Promise<KeralaPlaceInfo> {
  const cleaned = pincode.trim();
  if (!/^\d{6}$/.test(cleaned)) {
    throw new Error('Please enter a valid 6-digit postal PIN code.');
  }

  // 1. Check instant cache first
  const cachedSync = lookupKeralaPincodeSync(cleaned);
  if (cachedSync && cachedSync.source === 'api') {
    return cachedSync;
  }

  // 2. Query India Post Public API with a 3-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice)) {
        const offices: PostOfficeDetail[] = data[0].PostOffice;
        if (offices.length > 0) {
          const first = offices[0];
          const stateVal = (first.State || '').toLowerCase();
          const circleVal = (first.Circle || '').toLowerCase();
          const isKerala = stateVal === 'kerala' || circleVal.includes('kerala');
          const district = first.District || getKeralaDistrictByPrefix(cleaned).district;
          const officeNames = offices.map((o) => o.Name);
          const primaryName = offices.map((o) => o.Name).slice(0, 3).join(', ');

          const isFastHub = ['Ernakulam', 'Thrissur', 'Thiruvananthapuram'].includes(district);
          const estDays = isFastHub ? 1 : (['Idukki', 'Wayanad', 'Kasaragod'].includes(district) ? 3 : 2);

          const result: KeralaPlaceInfo = {
            pincode: cleaned,
            placeName: primaryName || first.Name,
            district,
            districtMalayalam: KERALA_DISTRICTS_ML[district] || district,
            talukOrBlock: first.Block || first.Division || district,
            postalDivision: first.Division,
            postOffices: officeNames,
            isKerala,
            isServiceable: isKerala,
            deliverySpeed: estDays === 1 ? 'Next Day (24h)' : (estDays === 2 ? '1-2 Days' : '2-3 Days'),
            estimatedDays: estDays,
            standardFee: estDays === 1 ? 40 : 50,
            expressAvailable: estDays <= 2,
            expressFee: isFastHub ? 80 : 100,
            codAvailable: isKerala,
            freeDeliveryThreshold: 499,
            source: 'api',
          };

          // Save to caches
          MEMORY_CACHE.set(cleaned, result);
          try {
            localStorage.setItem(`nexdrop_pin_${cleaned}`, JSON.stringify(result));
          } catch (e) {
            // Ignore quota issues
          }

          return result;
        }
      }
    }
  } catch (err) {
    // API request failed or timed out; fall back to local database
    // console.warn('India Post API unreachable, using local Kerala postal database', err);
  }

  // Fallback to local synchronous lookup
  const fallback = lookupKeralaPincodeSync(cleaned);
  if (fallback) return fallback;

  // Default catch-all
  return {
    pincode: cleaned,
    placeName: 'Kerala Regional Hub',
    district: 'Kerala',
    postOffices: [],
    isKerala: isKeralaPostalRange(cleaned),
    isServiceable: isKeralaPostalRange(cleaned),
    deliverySpeed: '1-2 Days',
    estimatedDays: 2,
    standardFee: 50,
    expressAvailable: true,
    expressFee: 95,
    codAvailable: true,
    freeDeliveryThreshold: 599,
    source: 'postal_series',
  };
}

/**
 * Filter popular Kerala PIN codes for rapid auto-suggest or quick selection
 */
export function searchKeralaPincodes(query: string): Array<{ pincode: string; placeName: string; district: string }> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: Array<{ pincode: string; placeName: string; district: string }> = [];

  for (const [pin, item] of Object.entries(KERALA_PINCODE_DATABASE)) {
    if (
      pin.includes(q) ||
      item.placeName.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q) ||
      item.taluk.toLowerCase().includes(q) ||
      item.postOffices.some((po) => po.toLowerCase().includes(q))
    ) {
      results.push({
        pincode: pin,
        placeName: item.placeName,
        district: item.district,
      });
      if (results.length >= 8) break;
    }
  }

  return results;
}
