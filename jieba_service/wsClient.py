# -*- coding: utf-8 -*-  

from socketIO_client import SocketIO, LoggingNamespace
import threading
from urllib import urlencode

class wsClient (object):

    def __init__(self, groupName='' ):
        super(wsClient, self).__init__()

        query = {}

        self.client = SocketIO('http://localhost:37001/ws', Namespace=LoggingNamespace, resource='')
        client = self.client

        for handler_name in dir(self):
            if handler_name.startswith('on_') : 
                event_name = handler_name[3:]
                print event_name
                client.on( event_name, getattr(self, handler_name) )


        client_thread = threading.Thread(target=client.wait)
        client_thread.daemon = True
        client_thread.start()

    def on_connect (self):
        print 'connected'
    
    def on_server_message(self, *args):
        print 'message :'
        print args

