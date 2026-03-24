import { Routes } from '@angular/router';

import { Chat } from './components/chat/chat';
import { Documents } from './components/documents/documents';
import { Upload } from './components/upload/upload';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'chat'
    },
    {
        path: 'chat',
        component: Chat
    },
    {
        path: 'documents',
        component: Documents
    },
    {
        path: 'upload',
        component: Upload
    },
    {
        path: '**',
        redirectTo: 'chat'
    }
];
