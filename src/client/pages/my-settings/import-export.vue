<template>
<section class="_card">
	<div class="_title"><fa :icon="faBoxes"/> {{ $t('importAndExport') }}</div>
	<div class="_content">
		<mk-select v-model="exportTarget">
			<option value="notes">{{ $t('_exportOrImport.allNotes') }}</option>
			<option value="following">{{ $t('_exportOrImport.followingList') }}</option>
			<option value="user-lists">{{ $t('_exportOrImport.userLists') }}</option>
			<option value="mute">{{ $t('_exportOrImport.muteList') }}</option>
			<option value="blocking">{{ $t('_exportOrImport.blockingList') }}</option>
		</mk-select>
		<mk-button inline @click="doExport()"><fa :icon="faDownload"/> {{ $t('export') }}</mk-button>
		<mk-button inline @click="doImport()" :disabled="!['following', 'user-lists'].includes(exportTarget)"><fa :icon="faUpload"/> {{ $t('import') }}</mk-button>
	</div>
	<input ref="file" type="file" style="display: none;" @change="onChangeFile"/>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faDownload, faUpload, faBoxes } from '@fortawesome/free-solid-svg-icons';
import MkButton from '../../components/ui/button.vue';
import MkSelect from '../../components/ui/select.vue';
import { apiUrl } from '../../config';

export default Vue.extend({
	components: {
		MkButton,
		MkSelect,
	},

	data() {
		return {
			exportTarget: 'notes',
			faDownload, faUpload, faBoxes
		}
	},

	methods: {
		doExport() {
			this.$root.api(
				this.exportTarget == 'notes' ? 'i/export-notes' :
				this.exportTarget == 'following' ? 'i/export-following' :
				this.exportTarget == 'blocking' ? 'i/export-blocking' :
				this.exportTarget == 'user-lists' ? 'i/export-user-lists' :
				null, {})
			.then(() => {
				this.$root.dialog({
					type: 'info',
					text: this.$t('exportRequested')
				});
			}).catch((e: any) => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});
		},

		doImport() {
			(this.$refs.file as any).click();
		},

		onChangeFile() {
			const [file] = Array.from((this.$refs.file as any).files);
			
			const data = new FormData();
			data.append('file', file);
			data.append('i', this.$store.state.i.token);

			const dialog = this.$root.dialog({
				type: 'waiting',
				text: this.$t('uploading') + '...',
				showOkButton: false,
				showCancelButton: false,
				cancelableByBgClick: false
			});

			fetch(apiUrl + '/drive/files/create', {
				method: 'POST',
				body: data
			})
			.then(response => response.json())
			.then(f => {
				this.reqImport(f);
			})
			.catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e
				});
			})
			.finally(() => {
				dialog.close();
			});
		},

		reqImport(file) {
			this.$root.api(
				this.exportTarget == 'following' ? 'i/import-following' :
				this.exportTarget == 'user-lists' ? 'i/import-user-lists' :
				null, {
					fileId: file.id
			}).then(() => {
				this.$root.dialog({
					type: 'info',
					text: this.$t('importRequested')
				});
			}).catch((e: any) => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});
		}
	}
});
</script>
