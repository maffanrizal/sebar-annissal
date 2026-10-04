export type Guest = {
  id: string;
  nama_tamu: string;
  status_kirim: "Belum" | "Sudah";
  created_at: string;
};

export type Wish = {
  id: string;
  nama_tamu: string;
  kehadiran: "hadir" | "ragu" | "tidak";
  pesan: string;
  created_at: string;
};

export type Settings = {
  nama_acara: string;
  base_link: string;
  template_pesan: string;
};
