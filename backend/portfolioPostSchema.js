import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from './nillionOrgConfig.js';
import { readFileSync } from 'fs';

const schema = JSON.parse(readFileSync(new URL('./portfolio.json', import.meta.url), 'utf-8'));

async function main() {
    try {
      const org = new SecretVaultWrapper(
        orgConfig.nodes,
        orgConfig.orgCredentials
      );
      await org.init();
  
      const collectionName = 'Portfolio';
      const newSchema = await org.createSchema(schema, collectionName);
      console.log('✅ New Collection Schema created for all nodes:', newSchema);
      console.log('👀 Schema ID:', newSchema[0].result.data);
    } catch (error) {
      console.error('❌ Failed to use SecretVaultWrapper:', error.message);
      process.exit(1);
    }
  }
  
  main();