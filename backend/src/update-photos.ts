import pool from './db';
import dotenv from 'dotenv';

dotenv.config();

const photoUrls: Record<string, string> = {
  "Joe Hunter": "https://static.wikia.nocookie.net/survivor/images/3/3e/S50_Joe_Hunter.jpg/revision/latest/scale-to-width-down/400?cb=20260128233541",
  "Savannah Louie": "https://static.wikia.nocookie.net/survivor/images/9/91/S50_Savannah_Louie.jpg/revision/latest/scale-to-width-down/400?cb=20260128233857",
  "Christian Hubicki": "https://static.wikia.nocookie.net/survivor/images/8/89/S50_Christian_Hubicki.jpg/revision/latest/scale-to-width-down/400?cb=20260128174729",
  "Cirie Fields": "https://static.wikia.nocookie.net/survivor/images/5/5c/S50_Cirie_Fields.jpg/revision/latest/scale-to-width-down/400?cb=20260128233255",
  "Ozzy Lusth": "https://static.wikia.nocookie.net/survivor/images/f/f6/S50_Ozzy_Lusth.jpg/revision/latest/scale-to-width-down/400?cb=20260128233638",
  "Emily Flippen": "https://static.wikia.nocookie.net/survivor/images/3/33/S50_Emily_Flippen.jpg/revision/latest/scale-to-width-down/400?cb=20260128233342",
  "Rick Devens": "https://static.wikia.nocookie.net/survivor/images/4/47/S50_Rick_Devens.jpg/revision/latest/scale-to-width-down/400?cb=20260128233756",
  "Jenna Lewis-Dougherty": "https://static.wikia.nocookie.net/survivor/images/e/e4/S50_Jenna_Lewis-Dougherty.jpg/revision/latest/scale-to-width-down/400?cb=20260128233416",
  "Jonathan Young": "https://static.wikia.nocookie.net/survivor/images/2/2c/S50_Jonathan_Young.jpg/revision/latest/scale-to-width-down/400?cb=20260129000605",
  "Dee Valladares": "https://static.wikia.nocookie.net/survivor/images/2/2b/S50_Dee_Valladares.jpg/revision/latest/scale-to-width-down/400?cb=20260129000526",
  "Mike White": "https://static.wikia.nocookie.net/survivor/images/a/ad/S50_Mike_White.jpg/revision/latest/scale-to-width-down/400?cb=20260129000719",
  "Kamilla Karthigesu": "https://static.wikia.nocookie.net/survivor/images/e/e9/S50_Kamilla_Karthigesu.jpg/revision/latest/scale-to-width-down/400?cb=20260129000639",
  "Charlie Davis": "https://static.wikia.nocookie.net/survivor/images/8/84/S50_Charlie_Davis.jpg/revision/latest/scale-to-width-down/400?cb=20260129000136",
  "Tiffany Nicole Ervin": "https://static.wikia.nocookie.net/survivor/images/e/e0/S50_Tiffany_Nicole_Ervin.jpg/revision/latest/scale-to-width-down/400?cb=20260129000837",
  "Benjamin Wade": "https://static.wikia.nocookie.net/survivor/images/a/a8/S50_Coach_Wade.jpg/revision/latest/scale-to-width-down/400?cb=20260129000450",
  "Chrissy Hofbeck": "https://static.wikia.nocookie.net/survivor/images/b/b3/S50_Chrissy_Hofbeck.jpg/revision/latest/scale-to-width-down/400?cb=20260129000221",
  "Colby Donaldson": "https://static.wikia.nocookie.net/survivor/images/8/82/S50_Colby_Donaldson.jpg/revision/latest/scale-to-width-down/400?cb=20260208205223",
  "Genevieve Mushaluk": "https://static.wikia.nocookie.net/survivor/images/8/82/S50_Genevieve_Mushaluk.jpg/revision/latest/scale-to-width-down/400?cb=20260208205302",
  "Rizo Velovic": "https://static.wikia.nocookie.net/survivor/images/8/8b/S50_Rizo_Velovic.jpg/revision/latest/scale-to-width-down/400?cb=20260208205520",
  "Angelina Keeley": "https://static.wikia.nocookie.net/survivor/images/0/00/S50_Angelina_Keeley.jpg/revision/latest/scale-to-width-down/400?cb=20260208205100",
  "Q Burdette": "https://static.wikia.nocookie.net/survivor/images/f/f9/S50_Q_Burdette.jpg/revision/latest/scale-to-width-down/400?cb=20260208205430",
  "Stephenie LaGrossa Kendrick": "https://static.wikia.nocookie.net/survivor/images/f/f5/S50_Stephenie_LaGrossa_Kendrick.jpg/revision/latest/scale-to-width-down/400?cb=20260208205601",
  "Kyle Fraser": "https://static.wikia.nocookie.net/survivor/images/d/db/S50_Kyle_Fraser.jpg/revision/latest/scale-to-width-down/400?cb=20260208205341",
  "Aubry Bracco": "https://static.wikia.nocookie.net/survivor/images/7/73/S50_Aubry_Bracco.jpg/revision/latest/scale-to-width-down/400?cb=20260208205135",
};

async function updatePhotos() {
  const client = await pool.connect();
  try {
    let updated = 0;
    for (const [name, url] of Object.entries(photoUrls)) {
      const result = await client.query(
        'UPDATE players SET photo_url = $1 WHERE name = $2',
        [url, name]
      );
      if (result.rowCount && result.rowCount > 0) updated++;
    }
    console.log(`Updated photos for ${updated} players`);
  } finally {
    client.release();
    await pool.end();
  }
}

updatePhotos().catch(console.error);
